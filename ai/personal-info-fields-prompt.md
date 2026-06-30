# Task: Add Location & Classification Fields to Personal Information Form (DigiBarangay Mobile)

Act as a senior React Native / Expo developer. Before writing any code, inspect the existing codebase patterns (Select/Dropdown component, API client/axios instance, React Query setup, Zustand auth store, form library being used — Formik/RHF/plain state) and **follow those exact conventions**. Do not introduce a new pattern if one already exists.

## Goal

Add 6 new fields to the Personal Information section of the citizen form:

| # | Field | Type | Source | State |
|---|-------|------|--------|-------|
| 1 | City/Municipality | Select | Logged-in user's `lguCode` | Disabled, prefilled |
| 2 | Barangay | Select | Logged-in user's `brgyCode` | Disabled, prefilled |
| 3 | District | Select | Static list: 1–7 | Enabled |
| 4 | Inhabitant Type | Select | API (new) | Enabled |
| 5 | Citizen Type | Select | API (new) | Enabled |
| 6 | Citizen Classification | Select | API (new), **depends on Citizen Type** | Enabled, disabled until Citizen Type chosen |

---

## 1. API Layer — port these from the web app

These already exist on web. Recreate the equivalent mobile service functions using this project's existing axios instance (check `services/` or `api/` folder for the configured client, base URL, and interceptors — reuse it, don't create a new one).

```js
export const getInhabitantsApi = async () => {
  return await axios.get(`content/inhabitants`);
};

export const getCitizenTypesApi = async () => {
  return await axios.get(`content/citizenTypes`);
};

export const getCitizenTypeClassificationsApi = async (typeId) => {
  return await axios.get("content/citizenTypeClassifications", {
    params: { typeId },
  });
};

export const getCitizenTypeClassificationByTypeApi = async (typeId) => {
  return await axios.get(`content/citizenTypeClassifications/${typeId}`);
};
```

Notes:
- Rename to match mobile naming conventions if the codebase uses a different style (e.g. `contentApi.ts`).
- `getCitizenTypeClassificationsApi` and `getCitizenTypeClassificationByTypeApi` look redundant (query param vs path param for the same resource) — check which one the backend actually expects for mobile before wiring both. Default to the query-param version (`?typeId=`) unless told otherwise, and don't implement the second one unless it's confirmed to be a different endpoint behavior.

## 2. React Query Hooks

Create hooks colocated with how the rest of the app does data fetching (check for an existing `hooks/queries` or similar folder):

```ts
useInhabitants()                          // GET content/inhabitants
useCitizenTypes()                         // GET content/citizenTypes
useCitizenTypeClassifications(typeId)      // GET content/citizenTypeClassifications?typeId=X
                                            // enabled: !!typeId — do NOT fetch until a Citizen Type is selected
```

Use sane `staleTime` for the static-ish lookups (inhabitants, citizen types) since these rarely change — e.g. 5–10 min — to avoid refetching every time the screen mounts.

## 3. Form Field Behavior

### City/Municipality & Barangay (disabled, prefilled)
- Pull `lguCode` and `brgyCode` from the authenticated user object in the Zustand auth store (check the existing account/profile screen — it already reads user info from this store, mirror that selector).
- These fields are **read-only context**, not user input. Render them as disabled Selects so the UI stays consistent with the rest of the form, but the value comes entirely from the store, never from user interaction.
- If the Select needs a *label* (not just a code) to display, check whether the user object already carries the display name (e.g. `lguName`, `brgyName`). If not, flag this — don't silently fetch an extra lookup API to resolve the label unless one already exists for this purpose.

### District
- Static dropdown, options `1` through `7`. No API call. Hardcode as a constant array (e.g. `DISTRICT_OPTIONS`), not inline in the component, so it's reusable/testable.

### Inhabitant Type
- Populate from `useInhabitants()`.

### Citizen Type
- Populate from `useCitizenTypes()`.
- On change, must reset the Citizen Classification field's current value (clear it) since classifications are scoped to a type — stale classification values from a previous type selection must never persist.

### Citizen Classification
- Populate from `useCitizenTypeClassifications(selectedCitizenTypeId)`.
- Disabled until a Citizen Type is selected.
- Refetches automatically when `selectedCitizenTypeId` changes (handled by React Query's query key including `typeId`).

## 4. UX / Edge Cases to Handle

- Loading state per dropdown (skeleton or disabled+spinner) while its options are fetching — don't block the whole form on one slow field.
- Error/retry state if a lookup API fails — don't let a failed fetch silently render an empty, confusing dropdown.
- Citizen Classification dropdown should show a clear placeholder like "Select Citizen Type first" when no type is selected, rather than just appearing empty/disabled with no explanation.
- If this form has validation (Formik/RHF/Zod or similar — check first), wire these fields into the existing validation schema rather than handling them ad hoc.

## 5. What NOT to do

- Don't build a new HTTP client — reuse the existing configured instance.
- Don't fetch Citizen Classification on mount — only after Citizen Type is selected.
- Don't implement both classification endpoint variants unless confirmed necessary.
- Don't make City/Municipality or Barangay editable, even temporarily, even as a "TODO" — they must be sourced from the logged-in user only.

## 6. Deliverables

1. New/updated API service functions for inhabitants, citizen types, citizen type classifications.
2. React Query hooks for the above.
3. Updated Personal Information form component with the 6 new fields wired per the rules above.
4. Constants file (or section) for the static District options.
