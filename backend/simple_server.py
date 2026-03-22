#!/usr/bin/env python3
from __future__ import annotations

from flask import Flask, jsonify, request
from flask_cors import CORS

from .services import ServiceError, serialize, service


app = Flask(__name__)
CORS(app)


def _respond(callable_, *args, **kwargs):
    try:
        payload, status = callable_(*args, **kwargs)
        return jsonify(serialize({'success': True, **payload})), status
    except ServiceError as err:
        return jsonify({'success': False, 'message': err.message}), err.status


@app.get('/api/health')
def get_health():
    return _respond(service.health)


@app.get('/api/menu')
def get_menu():
    return _respond(service.menu)


@app.get('/api/coupons')
def get_coupons():
    return _respond(service.coupons)


@app.get('/api/customers/<int:customer_id>')
def get_customer(customer_id: int):
    return _respond(service.customer, customer_id)


@app.post('/api/customers')
def post_customer():
    return _respond(service.create_customer, request.get_json(force=True, silent=True) or {})


@app.get('/api/orders/customer/<int:customer_id>')
def get_orders_for_customer(customer_id: int):
    return _respond(service.orders_for_customer, customer_id)


@app.post('/api/orders')
def post_order():
    return _respond(service.create_order, request.get_json(force=True, silent=True) or {})


@app.get('/api/recommendations')
def get_recommendations():
    return _respond(service.recommendations, request.args.get('customerId', type=int))


@app.get('/api/promotions')
def get_promotions():
    return jsonify({'success': True, 'data': serialize(service.coupons_for_display())}), 200


def run(host: str = '0.0.0.0', port: int = 5000) -> None:
    service.prepare()
    app.run(host=host, port=port, debug=False)


if __name__ == '__main__':
    run()
