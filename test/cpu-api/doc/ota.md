# OTA Model
The EIP expects payloads matching the OTA v1.5 model converted to JSON format.  However, the converted model may have AC specific changes.

## OTA as JSON
The following rules are applied to the OTA model to convert the XML structure to JSON.

- XML elements are converted to a JSON name with a JSON object as a value.
- XML attributes are converted to a name inside the JSON object.
- XML value for the attribute is the value for the latter name.
- XML elements with text values are converted to a JSON object with a "content" name.
- Rules in the XSD are converted over to RAML rules.

For example, an OTA FlightSegment in XML can be:

```
<FlightSegment
  DepartureDateTime="2018-09-02T11:00:00+02:00"
  ArrivalDateTime="2018-09-02T12:15:00-04:00"
  StopQuantity="0"
  RPH="1"
  FlightNumber="871"
  ResBookDesigCode="K"
  MealCode="MS">
  <DepartureAirport
    LocationCode="CDG"
    Terminal="2"/>
  <ArrivalAirport
    LocationCode="YUL"/>
  <Equipment
    AirEquipType="77W"/>
  <MarketingAirline
    Code="AC"
    CompanyShortName="Air Canada"/>
  <Comment>XXXX</Comment>
</FlightSegment>
```

Converted to JSON

```
{
  "FlightSegment": [
    {
      "DepartureDateTime": "2018-09-02T11:00:00+02:00",
      "ArrivalDateTime": "2018-09-02T12:15:00-04:00",
      "StopQuantity": 0,
      "RPH": 1,
      "FlightNumber": 871,
      "ResBookDesigCode": "K",
      "MealCode": "MS",
      "DepartureAirport": {
        "LocationCode": "CDG",
        "Terminal": "2"
      },
      "ArrivalAirport": {
        "LocationCode": "YUL"
      },
      "Equipment": {
        "AirEquipType": "77W"
      },
      "MarketingAirline": {
        "Code": "AC",
        "CompanyShortName": "Air Canada"
      },
      "Comment": {
        "content": "XXXX"
      }
    }
  ]
}
```

## Exclude OTA Extensions
The OTA Extension **TPA_Extensions** should be ignored as part of the JSON conversion.

## Extending the OTA Model
The EIP team will **NOT** extend the OTA model by removing or renaming an existing OTA element.

AC may add extra name/value pairs.  The name is prefixed with "AC_"

For example:

```
{
   "AC_CustomField": "Some Value"
}
```

## Missing Data Models
The OTA models may not represent all data models available from the EIP.

Missing models are exposed through the EIP as JSON using a similar conversion exercise as the OTA models.

## XSD Rules
The OTA cleanup process should carry over descriptions and validation from the XSD.

This is an example of a clean conversion.

```
#%RAML 1.0 Library
types:
  ActionType:
    description: Identifies an action to take place.
    enum: ['Add-Update','Cancel','Delete','Add','Replace']
    required: true
  DateOrDateTimeType:
    description: A construct to validate either a date or a dateTime value.
    type: date-only | datetime
    required: true
  InfoSourceType:
    description: Used to specify the source of the data being exchanged.
    type: string
    required: true
    minLength: 1
    maxLength: 32
  Percentage:
    description: Used for percentage values.
    type: number
    required: true
    minimum: 0.00
    maximum: 100.00
  GYearMonth:
    type: string
    pattern: ^([1-9][0-9]{3,}|0[0-9]{3})-(0[1-9]|1[0-2])(Z|(\+|-)((0[0-9]|1[0-3]):[0-5][0-9]|14:00))$
    required: true
```

The rules are applied on the body supplied to the API.

For example:
If my have an object with a **percent** name its value number be a number between 0.00 and 100.00.

```
{
    percent: 75.25
}
```

## Draft of the OTA Models
See this site [OTA Draft](https://anypoint.mulesoft.com/exchange/portals/bits-in-glass-inc/49ba7edd-e56e-44c1-9aaf-b627c93f70bd/ota-draft/)

**NOTE:** The draft model is inefficient so the site is **slow**.

## OTA Help
The EIP team is planning to have Business Analysts available to assist implementers to map data to the OTA JSON model.

This site [PilotFish](https://www.pilotfishtechnology.com/modelviewers/OTA/index.html) provides a useful tool to help explore the original XML format.
