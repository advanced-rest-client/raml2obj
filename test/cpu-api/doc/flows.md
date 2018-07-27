# Common Flow Sequence
Many booking flows following this sequence

- pre-book check
- authorize payment
- book
- pre-book ancillaries
- authorize payment
- book ancillaries
- issue documents

See :
1. Pre-Booking Check
2. Payment
3. Payments Card
4. Doc Issuance
5. Booking

# Payment Tokenization
The main EIP **MUST** only receive tokenized payment card numbers.

The client **MUST** use the EIP credit card tokenization service indirectly through DataPower or directly from the client.

# Payload Setup
The client should fill in as much information as possible into the OTA object for the API.

For example, for the main booking API, if ancillaries are provide the API will attempt to add them to the PNR on the same request.

**NOTE:** An API ignores extra data in object if its not appropriate in the context of the API.

# Conditional Behaviour
Some features of an API can be adjust by query parameter's provide by the API.

Some API's trigger a more specific feature by have a longer more specific path to a resource.
