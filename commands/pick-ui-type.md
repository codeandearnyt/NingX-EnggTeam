---
description: Pick the right UI type from the 24 for a given brief, with the reference site, the reason, and what it costs.
argument-hint: <what the page needs to do>
---

# /pick-ui-type

Read-only. Returns a recommendation with a reason and a cost, not a menu.

## Step 1 — Classify the content

Answer one question: **what is the visitor doing on this page?**

| Visitor is… | Candidate types |
|---|---|
| Reading one dense argument | 06, 05 |
| Scanning many varied items | 09, 10 |
| Comparing a small set | 05, 11 |
| Following a sequence | 21, 20 |
| Looking at one object | 22, 19, 24 |
| Being impressed | 13, 14, 23, 24 |
| Doing work fast | 12, 04, 01 |
| Being reassured | 04, 11, 18 |
| Being entertained | 08, 16, 17 |
| Reading structured data | 01, 06 |

## Step 2 — Filter by the brand signal

| The brand must read as… | Types that deliver it |
|---|---|
| Confident, sparse, expensive | 05 |
| Authoritative, dense | 06 |
| Warm, human, imperfect | 07, 17 |
| Loud, opinionated | 08, 03 |
| Calm, functional | 04 |
| Precise, technical | 12, 01 |
| Atmospheric, premium | 13, 14 |
| Nostalgic, playful | 16, 18 |
| Structural, engineered | 19, 10 |
| Immersive | 20, 21, 22, 23, 24 |

## Step 3 — Check the cost

Every type has a cost. State it.

| Type | Cost |
|---|---|
| 01 terminal | Alienates non-technical visitors. No imagery. |
| 03 brutalist | Reads as broken to anyone outside the reference. |
| 05 swiss | Needs genuinely sparse content. Empty if not. |
| 06 editorial | Needs real writing. Dies with placeholder copy. |
| 09 masonry | Highest CLS risk in the catalog. |
| 10 bento | Cells become arbitrary if content is not unequal. |
| 13 aurora | The most-copied AI look. Needs a light model. |
| 14 glass | Contrast fails easily. Needs a busy backdrop. |
| 15 neumorphism | Lowest contrast in the catalog. WCAG risk. |
| 19 isometric | Every asset must be drawn in the same projection. |
| 22 embedded 3D | 500KB–3MB of assets. LCP risk. |
| 23 WebGL | No-WebGL fallback is mandatory. |
| 24 WebXR | Most visitors have no headset. Needs a flat path. |

## Step 4 — Recommend one

```
RECOMMENDATION — <page>

Structural: 09-card-masonry
Reference:  pinterest.com
Reason:     content is heterogeneous and browsing is the task;
            a grid lets the images carry the hierarchy
Cost:       CLS is the highest in the catalog — every tile needs
            width/height and a reserved aspect ratio

Surface:    13-aurora, hero band only
Reason:     one atmospheric moment at the top, then get out of the way

Rejected:   10-bento — cells would be arbitrary, content is not
            unequal-weight
            05-swiss — needs sparse content, this page has forty items

Load: skills/ui-09-card-masonry, skills/ui-13-aurora-mesh-gradient
```

## Step 5 — If nothing fits

Say so. A page that needs a type not in the catalog is a page where the catalog is being stretched. Name the closest two and explain what does not fit.

Do not invent a 25th type. Use the closest and note the deviation.
