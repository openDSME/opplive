#!/usr/bin/env python3

from autopilot.input import Mouse
import time

mouse = Mouse.create()
current_location = ( 960, 540)
mouse.move(current_location[0], current_location[1], animate=False, rate=10, time_between_events=0.01)

def move(location):
    global current_location
    mouse.move(location[0], location[1], animate=True, rate=10, time_between_events=0.01)
    current_location = location

def click():
    mouse.click()

def drag(location):
    global current_location
    mouse.drag(current_location[0], current_location[1], location[0], location[1], rate=10, time_between_events=0.01)
    current_location = location

def sleep(s):
    time.sleep(s)

