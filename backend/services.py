#!/usr/bin/env python3
"""Simplified Smart Canteen service layer."""
from __future__ import annotations
import json, os
from collections import Counter
from datetime import datetime, date
from decimal import Decimal
from pathlib import Path
from threading import RLock
from typing import Any, Iterable

try:
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).with_name('.env'))
except Exception:
    pass

try:
    import mysql.connector as mysql
except Exception:
    mysql = None

class ServiceError(RuntimeError):
    def __init__(self, message: str, status: int = 400):
        super().__init__(message)
        self.message, self.status = message, status

def serialize(v: Any) -> Any:
    if isinstance(v, Decimal): return float(v)
    if isinstance(v, (datetime, date)): return v.isoformat()
    if isinstance(v, dict): return {k: serialize(x) for k, x in v.items()}
    if isinstance(v, Iterable) and not isinstance(v, (str, bytes)): return [serialize(x) for x in v]
    return v

class SmartCanteenService:
    TAX_RATE = 0.05
    DEFAULT_MENU = [{"item_id":1,"name":"Masala Chai","category_name":"Beverages","description":"Traditional Indian spiced tea","price":15.0,"stock_quantity":100,"preparation_time":5},{"item_id":2,"name":"Coffee","category_name":"Beverages","description":"Hot brewed coffee","price":20.0,"stock_quantity":80,"preparation_time":5},{"item_id":3,"name":"Cold Coffee","category_name":"Beverages","description":"Iced coffee with cream","price":35.0,"stock_quantity":50,"preparation_time":3},{"item_id":4,"name":"Orange Juice","category_name":"Beverages","description":"Fresh squeezed orange juice","price":25.0,"stock_quantity":30,"preparation_time":2},{"item_id":5,"name":"Samosa","category_name":"Snacks","description":"Crispy fried pastry","price":12.0,"stock_quantity":200,"preparation_time":8}]
    
    def __init__(self):
        root = Path(__file__).parent
        self.data = root / 'data'
        self.data.mkdir(exist_ok=True)
        self.files = {n: self.data / f'{n}.json' for n in ('menu','customers','orders')}
        self._lock = RLock()
        self._mysql_ready = None
        if not self.files['menu'].exists():
            self._write(self.files['menu'], self.DEFAULT_MENU)
    
    def _read(self, path, default):
        try:
            return json.loads(path.read_text('utf-8'))
        except Exception:
            return default
    
    def _write(self, path, data):
        path.write_text(json.dumps(data, ensure_ascii=False), encoding='utf-8')
    
    def _mysql_cfg(self):
        return {'host': os.getenv('DB_HOST','localhost'),'database': os.getenv('DB_NAME','smart_canteen'),'user': os.getenv('DB_USER','root'),'password': os.getenv('DB_PASSWORD',''),'port': int(os.getenv('DB_PORT','3306')),'charset': 'utf8mb4','connection_timeout': int(os.getenv('DB_TIMEOUT','5'))}
    
    def _use_mysql(self):
        if self._mysql_ready is None:
            flag = os.getenv('USE_MYSQL')
            if isinstance(flag, str) and flag.strip():
                enabled = flag.lower() in {'1','true','yes','on'}
            else:
                enabled = bool(mysql)
            self._mysql_ready = bool(mysql) and enabled
            if self._mysql_ready:
                try:
                    mysql.connect(**self._mysql_cfg()).close()
                except Exception:
                    self._mysql_ready = False
        return bool(self._mysql_ready)
    
    def _conn(self):
        if not self._use_mysql():
            return None
        try:
            return mysql.connect(**self._mysql_cfg())
        except Exception:
            self._mysql_ready = False
            return None
    
    def _coupons(self):
        now = datetime.now()
        wd, hr = now.weekday(), now.hour
        def active(start, end=None, days=None):
            if os.getenv('PROMO_ALWAYS_ON','').lower() in {'1','true','yes','on'}: return True
            if days and wd not in days: return False
            return hr >= start if end is None else start <= hr < end
        return [{"code":"BREAKFAST10","title":"Breakfast Saver","message":"10% off breakfast until 11 AM","time":"6-11 AM","category":"Breakfast","discount_percent":10,"active":active(6,11)},{"code":"SNACKS7","title":"Snack Time Deal","message":"7% off snacks 4-6 PM","time":"4-6 PM","category":"Snacks","discount_percent":7,"active":active(16,18)},{"code":"WEEKEND12","title":"Weekend Dessert","message":"12% off desserts Fri/Sat eve","time":"5 PM - close","category":"Desserts","discount_percent":12,"active":active(17,None,(4,5))},{"code":"CART10OFF50","title":"Cart Saver ₹10","message":"₹10 off subtotal 50","time":"All day","type":"cart","min_subtotal":50.0,"amount_off":10.0,"active":True},{"code":"CART30OFF100","title":"Cart Saver ₹30","message":"₹30 off subtotal 100","time":"All day","type":"cart","min_subtotal":100.0,"amount_off":30.0,"active":True},{"code":"CART60OFF200","title":"Cart Saver ₹60","message":"₹60 off subtotal 200","time":"All day","type":"cart","min_subtotal":200.0,"amount_off":60.0,"active":True}]
    
    def _category_discounts(self, extra):
        table = {}
        for c in self._coupons():
            pct = float(c.get('discount_percent') or 0)
            if c.get('category') and c.get('active') and pct>0:
                table[c['category']] = {"percent":pct,"label":c['title']}
        if extra:
            x = next((c for c in self._coupons() if c['code']==extra.upper()), None)
            if x and x.get('category') and x.get('active') and float(x.get('discount_percent') or 0)>0:
                table[x['category']] = {"percent":float(x.get('discount_percent') or 0),"label":x['title']}
        return table
    
    def _cart_discount(self, subtotal, code):
        subtotal = max(float(subtotal or 0),0.0)
        best = 0.0
        code = code.upper() if code else None
        for c in [c for c in self._coupons() if c.get('active') and ((c.get('type')=='cart') or (code and c['code']==code))]:
            if subtotal < float(c.get('min_subtotal') or 0): continue
            amount = float(c.get('amount_off') or 0)
            percent = float(c.get('percent_off') or 0)
            best = max(best,min(amount if amount>0 else subtotal*percent/100.0,subtotal))
        if best == 0.0 and subtotal > 0:
            if subtotal >= 200:
                best = 60.0
            elif subtotal >= 100:
                best = 30.0
            elif subtotal >= 50:
                best = 10.0
        return round(best,2)
    
    def _menu_rows(self):
        if self._use_mysql():
            conn = self._conn()
            if conn:
                try:
                    cur = conn.cursor(dictionary=True)
                    cur.execute("SELECT mi.item_id, mi.name, COALESCE(c.category_name,'') category_name, mi.description, mi.price, mi.stock_quantity, mi.preparation_time FROM Menu_Item mi LEFT JOIN Category c ON mi.category_id=c.category_id WHERE mi.status <> 'Discontinued' ORDER BY mi.name")
                    rows = cur.fetchall() or []
                except Exception:
                    rows = []
                finally:
                    cur.close()
                    conn.close()
                return rows
            return []
        return self._read(self.files['menu'], self.DEFAULT_MENU)
    
    def _decorate(self, rows):
        discounts = self._category_discounts(None)
        out = []
        for r in rows:
            base = float(r.get('price') or 0)
            d = discounts.get(r.get('category_name'))
            price = round(base*(1-(d['percent']/100)) if d else base,2)
            row = dict(r, base_price=round(base,2), price=price, discount_applied=bool(d))
            if d:
                row.update(discount_percent=d['percent'], discount_label=d['label'])
            out.append(row)
        return out
    
    def _db_execute(self, sql, params=None, fetch=True):
        conn = self._conn()
        if not conn:
            raise ServiceError('DB connection error',500)
        try:
            cur = conn.cursor(dictionary=True)
            cur.execute(sql, params or ())
            result = cur.fetchall() if fetch else None
            if not fetch:
                conn.commit()
                result = cur.lastrowid
            return result
        except Exception as exc:
            if not fetch:
                conn.rollback()
            raise ServiceError(f'DB error: {exc}',500)
        finally:
            cur.close()
            conn.close()
    
    def prepare(self):
        self._use_mysql()
    
    def health(self):
        if not self._use_mysql():
            return {"message":"API is healthy (JSON mode)"},200
        conn = self._conn()
        if conn and conn.is_connected():
            conn.close()
            return {"message":"API is healthy (MySQL)"},200
        raise ServiceError('Database connection failed',500)
    
    def menu(self):
        seen = set()
        unique = []
        for row in self._decorate(self._menu_rows()):
            name = str(row.get('name') or '').lower().strip()
            if name not in seen:
                seen.add(name)
                unique.append(row)
        return {"data":unique},200
    
    def coupons(self):
        return {"data":[{"code":c['code'],"title":c['title'],"message":c['message'],"time":c['time'],"category":c.get('category'),"discount_percent":c.get('discount_percent'),"amount_off":c.get('amount_off'),"min_subtotal":c.get('min_subtotal'),"type":c.get('type','category' if c.get('category') else 'cart'),"active":bool(c.get('active'))} for c in self._coupons()]},200
    
    def coupons_for_display(self):
        return [c for c in self._coupons() if c.get('active')]
    
    def customer(self, customer_id):
        if self._use_mysql():
            rows = self._db_execute('SELECT customer_id,name,email,phone,customer_type FROM Customer WHERE customer_id=%s',(customer_id,))
            if not rows:
                raise ServiceError('Not found',404)
            return {"data":rows[0]},200
        with self._lock:
            customers = self._read(self.files['customers'], [])
        row = next((c for c in customers if int(c.get('customer_id',0))==customer_id),None)
        if not row:
            raise ServiceError('Not found',404)
        return {"data":row},200
    
    def create_customer(self, payload):
        name = (payload.get('name') or '').strip()
        email = (payload.get('email') or '').strip()
        if not name or not email:
            raise ServiceError('Missing required fields')
        phone = payload.get('phone') or ''
        ctype = payload.get('customer_type') or 'Guest'
        if self._use_mysql():
            cid = self._db_execute('INSERT INTO Customer (name,email,phone,customer_type) VALUES (%s,%s,%s,%s)',(name,email,phone,ctype),fetch=False)
            return {"customer_id":cid},200
        with self._lock:
            customers = self._read(self.files['customers'], [])
            cid = max((int(c.get('customer_id',0)) for c in customers),default=0)+1
            customers.append({"customer_id":cid,"name":name,"email":email,"phone":phone,"customer_type":ctype})
            self._write(self.files['customers'], customers)
        return {"customer_id":cid},200
    
    def orders_for_customer(self, customer_id):
        if self._use_mysql():
            sql = "SELECT o.order_id,o.order_date,COALESCE(SUM(od.quantity*od.unit_price),0) subtotal,o.total_amount,o.payment_status,o.order_status,COUNT(od.order_detail_id) item_count,GROUP_CONCAT(CONCAT(mi.name,' x ',od.quantity) SEPARATOR ', ') items FROM Orders o LEFT JOIN Order_Details od ON od.order_id=o.order_id LEFT JOIN Menu_Item mi ON mi.item_id=od.item_id WHERE o.customer_id=%s GROUP BY o.order_id,o.total_amount ORDER BY o.order_date DESC"
            rows = self._db_execute(sql,(customer_id,))
            for r in rows:
                sub = round(float(r.get('subtotal') or 0),2)
                stored_total = round(float(r.get('total_amount') or 0),2)
                # Recalculate discount to ensure correct display (handles old orders created before discount fix)
                discount = self._cart_discount(sub, None)
                taxable = max(0.0, round(sub - discount, 2))
                tax = round(taxable * self.TAX_RATE, 2)
                correct_total = round(taxable + tax, 2)
                # Use recalculated total (with discount) instead of stored total
                r.update(subtotal=sub,tax_percent=int(self.TAX_RATE*100),tax_amount=tax,total_amount=correct_total)
            return {"data":rows},200
        menu_map = {int(m['item_id']): m for m in self._menu_rows()}
        orders = [o for o in self._read(self.files['orders'], []) if o.get('customer_id') == customer_id]
        out = []
        for o in orders:
            lines = o.get('line_items') or []
            if not lines:
                for chunk in (o.get('items') or '').split(','):
                    t = chunk.strip()
                    if not t: continue
                    name, _, qty_txt = t.rpartition(' x ')
                    m = next((r for r in menu_map.values() if r.get('name') == name), None)
                    lines.append({"item_id": (m.get('item_id') if m else None),"name": name or t,"quantity": int(qty_txt or '1'),"unit_price": float(m.get('price') if m else 0),"line_total": round(float(m.get('price') if m else 0) * int(qty_txt or '1'), 2)})
            for l in lines:
                item_id = l.get('item_id')
                ref = menu_map.get(int(item_id)) if item_id is not None else None
                if not l.get('name') and ref: l['name'] = ref.get('name')
                if float(l.get('unit_price') or 0) <= 0 and ref: l['unit_price'] = float(ref.get('price') or 0)
                qty = int(l.get('quantity') or 0)
                l['line_total'] = round(float(l.get('unit_price') or 0) * qty, 2)
            items_str = o.get('items') or ', '.join(f"{l.get('name','Item')} x {int(l.get('quantity') or 0)}" for l in lines) if lines else 'Items not available'
            item_count = o.get('item_count') or sum(int(l.get('quantity') or 0) for l in lines)
            sub = round(sum(float(l.get('line_total') or 0) for l in lines), 2)
            # Recalculate discount to ensure correct display (handles old orders created before discount fix)
            discount = self._cart_discount(sub, None)
            taxable = max(0.0, round(sub - discount, 2))
            tax = round(taxable * self.TAX_RATE, 2)
            correct_total = round(taxable + tax, 2)
            # Use recalculated total (with discount) instead of stored total
            out.append(dict(o, items=items_str, line_items=lines, subtotal=sub, tax_amount=tax, tax_percent=int(self.TAX_RATE * 100), total_amount=correct_total, item_count=int(item_count or 0)))
        out.sort(key=lambda r:r.get('order_date',''),reverse=True)
        return {"data":out},200
    
    def _priced_lines(self, items, menu, coupon):
        deals = self._category_discounts(coupon)
        lines = []
        total = 0.0
        for it in items:
            mid = int(it.get('item_id') or 0)
            qty = int(it.get('quantity') or 0)
            row = menu.get(mid)
            if not row or qty<=0: continue
            base = float(row.get('price') or 0)
            d = deals.get(row.get('category_name'))
            price = round(base*(1-(d['percent']/100)) if d else base,2)
            line = {"item_id":mid,"name":row.get('name'),"quantity":qty,"unit_price":price,"line_total":round(price*qty,2)}
            if d:
                line.update(discount_percent=d['percent'], discount_label=d['label'])
            lines.append(line)
            total += line['line_total']
        return lines, round(total,2)
    
    def create_order(self, payload):
        cid = payload.get('customer_id')
        items = payload.get('items') or []
        if not isinstance(cid,int) or not items:
            raise ServiceError('Invalid order payload')
        coupon = payload.get('coupon_code') or payload.get('coupon') or payload.get('promo_code')
        pay = payload.get('payment_method') or 'Cash'
        menu = {int(r['item_id']):r for r in self._menu_rows()}
        lines, subtotal = self._priced_lines(items, menu, coupon)
        if not lines:
            raise ServiceError('No items')
        discount = self._cart_discount(subtotal,coupon)
        taxable = max(0.0,round(subtotal-discount,2))
        tax = round(taxable*self.TAX_RATE,2)
        total = round(taxable+tax,2)
        if self._use_mysql():
            conn = self._conn()
            if not conn:
                raise ServiceError('DB connection error',500)
            try:
                cur = conn.cursor()
                cur.execute("INSERT INTO Orders (customer_id,total_amount,payment_status,order_status,payment_method) VALUES (%s,%s,'Paid','Completed',%s)",(cid,total,pay))
                oid = int(cur.lastrowid or 0)
                cur.executemany("INSERT INTO Order_Details (order_id,item_id,quantity,unit_price,total_price) VALUES (%s,%s,%s,%s,%s)",[ (oid,l['item_id'],l['quantity'],l['unit_price'],l['line_total']) for l in lines ])
                if lines:
                    cur.executemany("UPDATE Menu_Item SET stock_quantity=GREATEST(stock_quantity-%s,0) WHERE item_id=%s",[(l['quantity'],l['item_id']) for l in lines])
                conn.commit()
            except Exception as exc:
                conn.rollback()
                raise ServiceError(f'DB error: {exc}',500)
            finally:
                cur.close()
                conn.close()
            return {"order_id":oid,"subtotal":subtotal,"tax_percent":int(self.TAX_RATE*100),"tax_amount":tax,"total_amount":total,"coupon_code":coupon or '',"coupon_discount":discount},200
        with self._lock:
            orders = self._read(self.files['orders'], [])
            oid = max((int(o.get('order_id',0)) for o in orders),default=0)+1
            orders.append({"order_id":oid,"order_date":datetime.now().isoformat(),"items":', '.join(f"{l['name']} x {l['quantity']}" for l in lines),"order_status":'Completed',"payment_status":'Paid',"payment_method":pay,"subtotal":subtotal,"tax_percent":int(self.TAX_RATE*100),"tax_amount":tax,"total_amount":total,"item_count":sum(l['quantity'] for l in lines),"customer_id":cid,"line_items":lines})
            self._write(self.files['orders'], orders)
        return {"order_id":oid,"subtotal":subtotal,"tax_percent":int(self.TAX_RATE*100),"tax_amount":tax,"total_amount":total,"coupon_code":coupon or '',"coupon_discount":discount},200
    
    def recommendations(self, customer_id):
        promos = [{"code":c['code'],"title":c['title'],"message":c['message'],"time":c['time'],"category":c.get('category'),"discount_percent":c.get('discount_percent'),"amount_off":c.get('amount_off'),"type":c.get('type','category' if c.get('category') else 'cart'),"min_subtotal":c.get('min_subtotal')} for c in self.coupons_for_display()]
        if self._use_mysql():
            conn = self._conn()
            if not conn:
                return {"data":{"popular":[],"personal":[],"promotions":promos}},200
            try:
                cur = conn.cursor()
                cur.execute("SELECT mi.name, COUNT(DISTINCT od.order_id) FROM Order_Details od JOIN Menu_Item mi ON mi.item_id=od.item_id GROUP BY mi.name ORDER BY COUNT(DISTINCT od.order_id) DESC LIMIT 5")
                popular = [{'name':n,'times':int(t)} for n,t in cur.fetchall()]
                personal = []
                if customer_id:
                    cur.execute("SELECT mi.name, SUM(od.quantity) FROM Orders o JOIN Order_Details od ON od.order_id=o.order_id JOIN Menu_Item mi ON mi.item_id=od.item_id WHERE o.customer_id=%s GROUP BY mi.name ORDER BY SUM(od.quantity) DESC LIMIT 5",(customer_id,))
                    personal = [{'name':n,'times':int(t)} for n,t in cur.fetchall()]
            except Exception:
                popular = []
                personal = []
            finally:
                cur.close()
                conn.close()
            return {"data":{"popular":popular,"personal":personal,"promotions":promos}},200
        orders = self._read(self.files['orders'], [])
        pc, pers = Counter(), Counter()
        for o in orders:
            seen = set()
            for line in o.get('line_items') or []:
                name = line.get('name')
                qty = int(line.get('quantity') or 0)
                if not name or qty<=0: continue
                if name not in seen:
                    pc[name] += 1
                    seen.add(name)
                if customer_id and o.get('customer_id')==customer_id:
                    pers[name] += qty
        popular = [{'name':n,'times':c} for n,c in pc.most_common(5)] or [{'name':m['name'],'times':1} for m in self.DEFAULT_MENU[:5]]
        personal = [{'name':n,'times':c} for n,c in pers.most_common(5)]
        return {"data":{"popular":popular,"personal":personal,"promotions":promos}},200

service = SmartCanteenService()
