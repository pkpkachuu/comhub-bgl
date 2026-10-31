# BITS GOT LATENT — Security Architecture & Data Secrecy Specification

## 1. Data Invariants & Privacy Bounds

1. **Contestant Prediction Secrecy (Primary Rule):**
   - A contestant's self-predicted score must remain strictly confidential until the Administrator explicitly triggers the live broadcast reveal.
   - The judging panel (Samay Raina, Tanmay Bhat, guest judges) must NEVER be exposed to or capable of querying the `contestantSubmissions` collection.
   - Neither frontend conditionals nor client-side CSS hiding are acceptable for privacy. The backend authorization and Firestore security rules reject queries against `contestantSubmissions` by unauthenticated or non-admin users.

2. **Public Presentation Secrecy:**
   - The public projection screen endpoint (`/api/public/show-state`) only contains `revealedPrediction` if `revealState.predictionRevealed` is true.
   - It only contains `revealedPanelScore` if `revealState.panelScoreRevealed` is true.
   - Unrevealed scores are never transmitted across the wire to public presentation or contestant clients.

3. **Terminal Locking & Administrative Override:**
   - Once a contestant submits their predicted score via the Contestant Portal (`/api/contestant/submit`), `isLocked` is set to `true`.
   - Further edits by the contestant are rejected with `403 Forbidden`.
   - Only authorized backstage administrators (`/api/admin/unlock-submission`) can unlock the vault to allow emergency corrections.

## 2. Collections & Access Control Matrix

| Collection | Role: Admin | Role: Panel Judge | Role: Contestant | Role: Public Projector |
| :--- | :--- | :--- | :--- | :--- |
| `/contestants` | Read, Create, Update, Delete | Read Only | Read Only | Read Only |
| `/microInfluencers` | Read, Create, Update, Delete | Read Only | Read Only | Read Only |
| `/panelScores` | Read, Create, Update, Delete | Read & Write (Own Sheet) | FORBIDDEN | Read Only (Only if Revealed) |
| `/contestantSubmissions` | Read, Unlock | FORBIDDEN (No List/Read) | Create (Locked Once) | Read Only (Only if Revealed) |
| `/showState` | Read, Update | Read Only | FORBIDDEN | Read Only (Public State) |
| `/presentationEvents` | Create, Read | Read Only | FORBIDDEN | Read Only (SSE Sync) |

## 3. Data Integrity Tests & Penetration Defense

1. **Shadow Update Test:**
   - Attempting to pass ghost fields (e.g., `isAdmin: true` or `isSuperUser: true`) is blocked by strict schema key validation.
2. **Panel Prediction Snooping Test:**
   - Attempting to call `GET /api/public/show-state` when `revealState.predictionRevealed == false` returns `null` for both `revealedPrediction` and `revealedPanelScore`.
3. **Double Submission Test:**
   - Attempting to submit a second predicted score after the first is sealed returns `403 Forbidden: Your score has already been sealed and vaulted`.
4. **Out-of-Bounds Score Injection Test:**
   - Scores below 0 or above 100 are rejected and clamped safely by server validation.
