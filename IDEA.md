# Glimt: The Daily Key

**The Core Concept:** A physical-style photo journal for close friend groups. You cannot be a passive consumer of your friends' lives. Your daily, unedited "blind snap" is the physical key that unlocks your shared history.

---

## 1. Visual Design: The "Analog Darkroom" Palette

The interface is dark, rich, and tactile, simulating the cozy warmth of a photographer’s classic darkroom. We completely avoid harsh pure whites and blacks to prevent eye strain.

```text
BACKGROUNDS:
█ #0E0D0C -> Primary Background (Pure, warm, dark-mode slate)
█ #1B1817 -> Secondary Background (Frames, folders, and calendar cards)

HIGHLIGHT COLORS:
█ #FF7F00 -> Safety Orange (Luminous, pure color for active buttons and ready states)
█ #E65C00 -> Deep Amber (Used for secondary highlight accents and active lines)

TYPOGRAPHY Colors:
█ #F2EFEA -> Cream White (Primary text: warm, extremely legible, soft on the eyes)
█ #8C847E -> Film Gray (Secondary text: used for timestamps and countdown clocks)
█ #12100F -> Deep Charcoal (Used for dark text sitting directly on top of orange buttons)
```

---

## 2. The Daily User Experience (The Core Loop)

The app operates on a clean binary: it is either **Locked** or **Unlocked**. The lock resets at midnight.

### 🌅 The Morning Vault (Locked State)
At midnight local time, the app blurs and locks. You cannot view today’s photos, yesterday’s photos, or a single page of history. The prompt reads: `Insert today's key.`

### 📸 Step 1: The Blind Snap (3 Seconds)
*   You open the app. The live camera is waiting.
*   You tap the shutter to take a **Blind Snap** (no preview, no filters, no retakes). 
*   You type a quick status of a maximum of 50 characters in **Cream White** (`#F2EFEA`) to express your state of mind.

### 👥 Step 2: The Master Snap (Send-to-All Default)
*   You only take **one** snap per session. It shares to all your groups by default.
*   **The Split-Second Bypass:** On the caption screen, tap any of your group icons at the bottom of the screen to deselect them if you want to skip sharing with that specific circle.

### 🔓 Step 3: The Reveal (Unlocked State)
*   The moment you hit send, the heavy blur dissolves like ink clearing in water.
*   The app is now fully unlocked. You can immediately review today's snaps, browse yesterday's fully developed roll, and scroll back through months of archives.

---

## 3. Cooldown & The "Anticipation" Widget

To prevent over-posting and keep photos raw, the camera locks down for exactly 15 minutes after every snap. This countdown is reflected on your phone's home screen.

```text
 [Take Glimt] ──► [App Unlocks] + [Widget starts 15m Cooldown]
                                         │
                                         ▼
                 [At 0:00] ──► [Widget hits 'READY' state (Big Nudge)]
```

### Inside the App
During the 15-minute block, the camera viewfinder is heavily dimmed. The shutter button is replaced by a ticking countdown in **Film Gray**: `⏱️ 14:59`. You are physically locked out from taking another photo.

### On the Home Screen Widget
The widget serves as a silent, beautiful visual anchor that actively nudges you throughout the day.
*   **The Countdown State (15m):** Displays a circular countdown progress bar: `Ready in 14:20`. This signals that you are in "living" mode rather than "posting" mode.
*   **The "Ready" State (The Big Nudge):** The second the clock hits zero, the widget border pulses in **Safety Orange** (`#FF7F00`), displaying: `[ ⊙ Ready to Snap ]`. Tapping the widget instantly launches the camera.
*   **The Active Dots:** The widget displays your group members' icons with active progress dots indicating their posts today (e.g., `🟠 Marcus: 3 snaps, 🟡 You: 1 snap`). This quietly encourages you to post more to keep up.

---

## 4. Gamifying Consistency: The Orange Glimt Grid

Instead of likes and view counts, groups play a cooperative game of keeping their shared calendar alive. Each profile features a GitHub-style calendar grid tracking the daily volume of snaps:

*   ⬜ **0 Snaps:** `#262220` (Dusty charcoal outline; represents a missing day).
*   🟧 **1 Snap (Key):** `#5E2B00` (Dark, burnt copper; unlocks the app!).
*   🟧 **2–3 Snaps:** `#B35300` (Warm, glowing ember orange; active day).
*   🔥 **4+ Snaps:** `#FF7F00` (Vibrant Safety Orange; a highly active, legendary day).

---

## 5. The 4 Aesthetic "Lenses"

Once your day is unlocked, you can instantly toggle the layout of any day, week, month, or year using four distinct, beautiful layouts via a floating segment-switch:

1.  💬 **Chat (The Narrative):** A clean vertical timeline. Read through your friends' days chronologically with their raw blind snaps paired with their captions in text bubbles. Best for reading and catching up.
2.  📌 **Mosaic (The Aesthetic):** A Pinterest-style masonry grid. Captions are hidden until tapped, transforming your group’s raw daily moments into a cozy, collaborative moodboard.
3.  🎞️ **Roll (The Analog):** Your interface rotates to widescreen, presenting photos in a continuous, endless horizontal 35mm filmstrip with sprocket holes. Best for scanning memory history.
4.  ⚡ **Flash (The Energy):** A high-energy, stop-motion looping time-lapse. Hold this button down to instantly play a rapid loop (0.3 seconds per crop) of your days, weeks, or months, complete with tactile haptic clicks.

---

## 6. Smart Push Notifications

Notifications behave differently depending on whether your app is currently Locked or Unlocked for the day.

### Locked State (Baiting the Daily Key)
*   **The Unlock Nudge:** When a friend takes today's first snap: *"Yesterday’s roll is fully developed! ☕️ Marcus just unlocked it. Snap today to see what everyone did."*
*   **The Evening Rescue:** Sent at 8:00 PM local time: *"Don't let the grid go gray! ⬜ Take today's snap to keep the calendar orange."*

### Unlocked State (Building the Storyboard)
Today's photos are kept secret in the "darkroom" until tomorrow, but to encourage multiple daytime posts, the app uses peer activity:
*   **The Domino Effect:** When a friend takes their 2nd or 3rd snap, you get a ping: *"Marcus just added a new frame to today's roll! 🎞️ What are you up to right now? Tap to capture."*
*   **The Vibe Check:** Once or twice a day, a synchronized group notification fires: *"⚡ VIBE CHECK! ⚡ Group 'Uni Crew' is syncing up. Take a quick blind snap of your current view in the next 15 minutes."*

---

## 7. Solved Edge Cases

*   **Timezones (Local Calendar Mapping):** Photos are tied to the local date on the user's phone clock at the moment of capture, alongside their absolute UTC timestamp. London, Stockholm, and Dubai friends will have their Thursday snaps grouped under the same "Thursday, June 25th" journal card, regardless of the hours separating them.
*   **The "Cold Start" (My Journal):** Every user starts with a private collection of one. It acts as an unlocked, private personal diary to catalog your year before you invite others.
*   **Late Group Joins (Join-Date Lock):** When a new friend enters a group, their access to the group's history begins strictly on their join date. Everything recorded before that date is completely hidden to protect the group's past privacy.
*   **Physical Reunions (The QR "Huddle" Capsule):** No creepy GPS trackers. On designated Capsule Days, photos are sent to a vault. To unlock, one friend displays a unique QR code with a 30-second countdown in the app. Friends must physically stand together and scan it to trigger a shared "unboxing" of those weeks.
*   **Onboarding (Frictionless Deeplinks):** Users only configure a name, unique username, and profile icon. To invite friends, you generate a 5-digit group code (like `GLMTX`) or deep-link to paste directly into your existing group chats. Friends join in under 10 seconds.