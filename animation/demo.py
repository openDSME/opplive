#!/usr/bin/env python3

from animation import move, click, drag, sleep

# locations
loc_initial                 = ( 960,  540)

loc_send_interval_initial   = ( 145,  865)
loc_send_interval_3         = ( 100,  865)

loc_node_14_initial         = ( 105,  330)
loc_node_14_final           = ( 545,  705)

loc_reset                   = ( 490,  875)

loc_dsme_traffic_top        = (2390,  185)
loc_csma_traffic_top        = (3380,  185)

while True:
    click()

    sleep(10)
    move(loc_dsme_traffic_top)
    sleep(4)

    move(loc_send_interval_initial)
    sleep(1)
    drag(loc_send_interval_3)
    sleep(15)

    move(loc_node_14_initial)
    sleep(1)
    drag(loc_node_14_final)
    sleep(15)

    move(loc_reset)
    sleep(1)
    click()
    sleep(1)

    move(loc_initial)
    sleep(20)
