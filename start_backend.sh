#!/bin/bash

uvicorn backend.main:app --host 0.0.0.0 --port 8000 --timeout-keep-alive 30000 --log-level debug
