#  Guidance
The EIP is in active development.  The intent is to stabilize the API contracts so API clients are not effected by changes in implementation.

## Parameterize Host
Implementer should parameterize host name as part of the implementation.

The host name may change for any of the following reasons:

- Different environments may have different host names
- The introduction of a dedicated load balancer will change a host name
- Changes in the internal deployment model may change a host name

## Parameterize Path
Implementer should parameterize URL paths when call the EIP.

The features provided by the resource **should** remain the same but the path to the resource may change.

For example, 
.../booking/{pnr}
  may change to
.../reservations/{pnr}

The path may change for the following reasons:

- Fix typo
- Agreement on a better noun
- Addition or removal of extra nouns in the path due to semantic changes

## Assume the OTA Model
The EIP team intends to honour the OTA model.  See the OTA Model section for details.

Implementer using resource that are OTA model are unlikely to be effected by data model changes.

## Missing Features
The EIP may have missed a feature when designing the contract.

If you think you cannot find a feature please let the EIP Team know:
- Arash Mahin
- Slav Martinov
- Wing Hui
- Juan Ore
- Margaret Fydell
- Charnjit Gill

Someone will either:
- Help you find the proper resource
- Propose a API contract addition that is not disruptive to other implementers
