@echo off
chcp 65001 > nul
cd /d C:\Users\v.serdyuk\Documents\AIGrowth\RiseCoreFlow
set PYTHONIOENCODING=utf-8
python -X utf8 scripts\publish_omf_diagnostic.py >> scripts\publish_omf.log 2>&1
