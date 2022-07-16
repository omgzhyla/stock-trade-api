# NOTES

## `Ajv` validation library
Fastify documentation suggests `Ajv` for request validation purposes. I don't like the fact it throws plain `Error`
exception and there's no way to guest that it was a validation error in the top-level error handler.

## `Server` class structure
It might be better to use some `builder` pattern here.

## Stocks stats
Not sure if I understood what `daily` actually means: 

Fluctuation is defined via `daily rise` and `daily fall` in price and sounds like it's somehow related to calendar day. 
However, stock price plot describes price fluctuation as three trades happened in two different days: 
the lowest price is on June 25 and following higher price was on next day June 26.

I implemented algorithm that doesn't take in account actual dates.
