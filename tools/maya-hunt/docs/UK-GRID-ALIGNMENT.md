# Maya cards: alignment with UK DNO and TSO reality

Populated 2026-09-14 15:07:52 UTC by the MSI lab from the estate's own declared data (`Ventusltd/data_uk_dno_and_tso`).
**State: screening / declared.** Every row below is declared seed data and carries the repo's own instruction to
verify against Ofgem, Elexon and the NESO/DNO portals before publication. Nothing here is presented as settled;
that honesty is the point (see `docs/doctrine/SPIDER_MAYA_REMOVER.md`).

## Why this sits next to the Maya cards

A Maya card explains a dead end's function, purpose, relationships and reason. For a grid-relevant block the
**purpose** face should land on the real body that owns the decision: **Elexon** for settlement and price,
**NESO** (National Energy System Operator) for the transmission network and connections, and the **DNO** for
distribution headroom. A project connects where a cable meets a substation inside one DNO licence area, under NESO's
network model, priced on Elexon's settlement — so a card about distance, capacity or price can name the body a
reader would go to next.

## The 14 GB distribution licence areas (DNOs)

| Area ID | GSP group | Licence area | Licensed entity | Operator |
|---|---|---|---|---|
| 10 | _A | Eastern England | Eastern Power Networks plc | UK Power Networks |
| 11 | _B | East Midlands | National Grid Electricity Distribution East Midlands plc | National Grid Electricity Distribution |
| 12 | _C | London | London Power Networks plc | UK Power Networks |
| 13 | _D | Merseyside and North Wales | SP Manweb plc | SP Energy Networks |
| 14 | _E | West Midlands | National Grid Electricity Distribution West Midlands plc | National Grid Electricity Distribution |
| 15 | _F | North Eastern | Northern Powergrid Northeast plc | Northern Powergrid |
| 16 | _G | North Western | Electricity North West Ltd | Electricity North West |
| 17 | _P | North Scotland | Scottish Hydro Electric Power Distribution plc | Scottish and Southern Electricity Networks Distribution |
| 18 | _N | South Scotland | SP Distribution plc | SP Energy Networks |
| 19 | _J | South Eastern | South Eastern Power Networks plc | UK Power Networks |
| 20 | _H | Southern England | Southern Electric Power Distribution plc | Scottish and Southern Electricity Networks Distribution |
| 21 | _K | South Wales | National Grid Electricity Distribution South Wales plc | National Grid Electricity Distribution |
| 22 | _L | South Western England | National Grid Electricity Distribution South West plc | National Grid Electricity Distribution |
| 23 | _M | Yorkshire | Northern Powergrid Yorkshire plc | Northern Powergrid |

**UKPN** operates 3 of the 14 areas: Eastern England (Eastern Power Networks plc), London (London Power Networks plc), South Eastern (South Eastern Power Networks plc).

## System operator and transmission owners (TSO/SO/TO)

| Region | System operator | Transmission owner |
|---|---|---|
| England and Wales | National Energy System Operator | National Grid Electricity Transmission |
| South Scotland | National Energy System Operator | SP Transmission |
| North Scotland | National Energy System Operator | SSEN Transmission |
| Northern Ireland | SONI | NIE Networks |
| Republic of Ireland | EirGrid | ESB Networks |

NESO is modelled as the **system operator, not an asset owner**; the transmission owners (National Grid Electricity
Transmission, SP Transmission, SSEN Transmission) hold the assets. IDNOs operate non-geographic networks inside a
DNO area. NI and RoI are carried for atlas coverage (NIE Networks/SONI, ESB Networks/EirGrid).

## How the hunt uses this (next step, not yet wired)

`maya-hunter.mjs` can add a **body** to the purpose face when a block's category is grid-relevant: prices → Elexon
(BMRS/settlement); grid-network, connection, firm-capacity → NESO; connection-capacity/headroom → the DNO for the
project's licence area (from its coordinates via the 14-area boundary). The join key is the DNO area ID (10–23) that
`data_uk_dno_and_tso` defines. Until the declared rows are verified, the card must say **declared, verify against
Ofgem/Elexon/NESO** and never present a headroom or rating the operator has not published.

## Sources named in the estate data

- NESO portal and public datasets (DNO licence-area boundaries).
- DNO open-data portals (per-operator headroom and capacity).
- Ofgem (licence areas and entities).
- Elexon (settlement, GSP groups, ~161,000 half-hourly periods since 2016, per the mission).
