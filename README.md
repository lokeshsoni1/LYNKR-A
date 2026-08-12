# Lynkr Link Manager

Build a modern, minimal, dark-first SaaS application for "Lynkr" - a URL Shortening Platform. 

STRICT DESIGN SYSTEM:

- Theme: Dark-first, near-black background (#09090B), pure white text, neutral gray borders (#27272A), controlled vibrant blue accents (#2563EB / #3B82F6).

- Typography: Inter or Geist font, highly readable, spacious padding, zero clutter.

- NO gradients, NO glassmorphism, NO heavy glows, NO pricing tables, NO QR codes, NO social logins.

PAGES & ROUTING TO BUILD:

1. Main Navbar (Global):

   - Left: LYNKR logo text.

   - Center: Home (/), My Links (/links), Analytics (/analytics).

   - Right (Guest): Login (/login) [Outline], Get Started (/register) [Solid Primary].

   - Right (Logged In): User Name / Avatar dropdown, Logout button.

2. Home Page (/):

   - Hero: Eyebrow "SHORTEN. TRACK. UNDERSTAND.", Heading "Turn long URLs into simple, shareable links.", Supporting text, Primary CTA "Shorten a URL", Secondary CTA "Get Started".

   - URL Shortener Card: Main input ("Paste your long URL here..."), "Shorten URL" button, loading state ("Shortening..."). Output card displaying short link "https://lynkr.ly/aB12xZ" with a "[Copy]" button transitioning to "✓ Copied".

   - Link Customization Accordion: Collapsible "Customize your link" section containing Custom Alias input and Expiration dropdown (Never, 1 Hour, 24 Hours, 7 Days, 30 Days, Custom).

   - Three Core Benefits: Simple text blocks for "FAST REDIRECTS", "CUSTOM LINKS", "BASIC ANALYTICS".

   - How It Works: 3-step vertical flow (STEP 01 CREATE -> STEP 02 SHARE -> STEP 03 ANALYZE).

   - Feature Overview: 8-item grid (01 URL Shortening, 02 Fast URL Redirect, 03 Easy Copy, 04 Click Counter, 05 Custom Alias, 06 Link Expiration, 07 Basic Analytics, 08 User Authentication).

   - Analytics Preview: Sample cards displaying Total Clicks (2,481), Unique Visitors (1,721), simple line chart for Clicks Over Time, and device breakdown bars (Mobile 68%, Desktop 28%, Tablet 4%).

   - Final CTA & Minimal Footer.

3. Auth Pages (/login & /register):

   - Clean, centered dark card layout.

   - Login: Email, Password, Login button, link to /register.

   - Register: Name, Email, Password, Create Account button, link to /login.

4. My Links Page (/links):

   - Page header "My Links", "Create Short Link" button, Search input.

   - Data Table: Columns for Short URL, Original URL, Clicks, Created Date, Expiration, Status badge (ACTIVE [Green] / EXPIRED [Red]), Actions ([Copy], [Analytics], [Delete]).

   - Create Link Modal: Destination URL, Custom Alias, Expiration dropdown, Create button.

   - Delete Confirmation Modal.

5. Analytics Page (/analytics) & Individual Link Page (/links/[id]):

   - Summary Cards: Total Clicks, Unique Visitors, Total Links, Active Links.

   - Simple Clicks Over Time line chart with 7 Days / 30 Days toggle.

   - Breakdown sections for Devices, Browsers, Traffic Sources (Referrers), and Recent Activity log.

ALSO THEN , PUSH ALL THE CHANGES AND CODE TO GITHUB ALSO !!! 
THE REPOSITRY AND LINKS ARE : - 
git remote add origin https://github.com/lokeshsoni1/LYNKR-MAIN.git

git branch -M main

git push -u origin main

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://lynkr-link-magic.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b1488253-2d18-45fd-83d3-998bdb2338e9).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
