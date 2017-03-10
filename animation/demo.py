#!/usr/bin/env python3

from autopilot.input import Mouse

mouse = Mouse.create()

mouse.move(100, 50, animate=True, rate=15, time_between_events=0.01)
mouse.click()
