# Authority Order

Gemini must resolve conflicts using this order:

1. `prd-phase1.md`
2. `api-contract.md`
3. `schema-draft.md`
4. `validation-rules.md`
5. `error-contract.md`
6. `action-coverage-map.md`
7. Approved files in `01_launch_data/`
8. Files in `99_reference_only/` for background only

## Hard rules

- Do not invent features outside the contract
- Do not upgrade brainstorm ideas into scope
- Do not treat raw species research as launch truth unless the record is marked approved
- If a requested behavior is not supported by the contract, call it out as contract drift
- If a record is `searchable_only`, Gemini must not treat it as fully supported for compatibility or guidance
