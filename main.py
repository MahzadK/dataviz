#! /usr/bin/python
# -*- coding:utf-8 -*-

from flask import Flask, render_template, session, request, redirect, flash
app = Flask(__name__)

@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)