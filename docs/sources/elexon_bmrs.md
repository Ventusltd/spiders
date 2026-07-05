# Elexon BMRS Source Card

Document type: source-card

Source name: Elexon Balancing Mechanism Reporting Service

Publisher / owner: Elexon

Primary URL: study required

Source-card status: draft

Last checked: unknown

Licence: study required

Attribution requirement: study required

Access method: API or published service endpoints

API key required: study required

Rate or access limits: study required

Data type: electricity market, settlement, generation and balancing data

Update frequency: study required

Declared fields: values explicitly returned by Elexon endpoints or documented by Elexon

Derived-only fields: aggregations, reconciliations, technology grouping, anomaly flags and Spider classifications

Known gaps: endpoint coverage, field interpretation, revision timing and API availability require study

Known failure modes: API failure, empty periods, late settlement revisions, schema drift, rate limits

Allowed Spider use: source study, derived scan, evidence support and links to data repositories that already process BMRS data

Not-allowed Spider use: presenting derived reconciliation or grouping as Elexon-declared truth

Screening boundary: Spider use is screening and evidence support only; not market settlement certification

Notes: this source should be reconciled with `Ventusltd/data-gb-electricity` before deeper integration.
