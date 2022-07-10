# NOTES

## `Ajv` validation library
Fastify documentation suggests `Ajv` for request validation purposes. I don't like the fact it throws plain `Error`
exception and top-level error handler needs to guess that it was a validation error.

## `Server` class structure
It may be better to use some `builder` pattern here.
