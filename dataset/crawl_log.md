# Volleyball Events Crawl Log

Generated: 2026-06-13T08:58:02.273Z

- Total input records: 50
- Total deduped records: 47
- Records merged via dedup: 3
- Records with all critical fields: 18

## Per-source summary

### tlsports

- Source URL: https://www.tl-sports.com/
- Event count (after dedup): 11
- JS-required hosts encountered:
  - https://tls.volleyballlife.com/ (SPA)
  - https://tls.volleyballlife.com/events (SPA, loading placeholders)
  - https://volleyballlife.com/tournament/38085?tab=information (SPA, only title)
  - https://tls.volleyballlife.com/event/38347?tab=information (SPA)
  - https://volleyballlife.com/event/38606?tab=information (SPA)
  - https://www.volleyballlife.com/ (SPA)
- Broken / blocked registration / detail links (HTTP 403 / login wall / bot block):
  - https://tls.volleyballlife.com/api/event/38347 (HTTP 403)
  - https://www.lemovolleyball.com/ (HTTP 403)
- Probed paths that 404:
  - https://www.tl-sports.com/about (404)
  - https://www.tl-sports.com/contact (404)
  - https://www.tl-sports.com/events (404)
  - https://www.tl-sports.com/upcoming-events (404)
  - https://www.tl-sports.com/indoor-tournaments (404)
  - https://www.tl-sports.com/grass-volleyball (404)
  - https://www.tl-sports.com/outdoor (404)

### noattitudes

- Source URL: https://www.noattitudesbeachvolleyball.com/upcoming-events
- Event count (after dedup): 11
- Broken / blocked registration / detail links (HTTP 403 / login wall / bot block):
  - https://beachvolley.app (HTTP 403)
  - https://beachvolley.app/e/RoZn5gIA3v4kJNhmkT1K (HTTP 403)
  - https://beachvolley.app/e/ (HTTP 403)

### gdoc

- Source URL: https://docs.google.com/document/d/e/2PACX-1vSeNyslmA1uxMHbuJQEJ-vvsQkNqI2XrKkrzeS5FYd_eTbYycwqu1MFmUNm5NWxd6JBi-KE1qHHk_y7/pub
- Event count (after dedup): 10
- Broken / blocked registration / detail links (HTTP 403 / login wall / bot block):
  - https://facebook.com/events/2157351711336692 (HTTP 403)
  - https://facebook.com/events/836582889465761 (HTTP 403)
  - https://facebook.com/events/1519242606215680 (HTTP 403)
  - https://facebook.com/events/26221887760766283 (HTTP 403)
  - https://facebook.com/events/1255850129994276 (HTTP 403)
  - https://facebook.com/events/1289535189915847 (HTTP 403)
  - https://facebook.com/events/1254556109542430 (HTTP 403)
  - https://facebook.com/events/1476251057191693 (HTTP 403)
  - https://facebook.com/events/1417592443166691 (HTTP 403)
  - https://facebook.com/events/2365108533989953 (HTTP 403)
  - https://facebook.com/events/1549751792914484 (HTTP 403)
  - https://www.facebook.com/media/set/?set=a.* (HTTP 403, multiple)
  - http://bit.ly/fvbl-* (HTTP 403, multiple)
  - https://fvbl.ca (HTTP 403)
  - https://www.fraservalleybeachleague.com (HTTP 403)

### sfdynastyvb

- Source URL: https://sfdynastyvb.com/upcoming-events
- Event count (after dedup): 12
- JS-required hosts encountered:
  - https://volleyballlife.com/event/35106 (SPA, only title rendered)
  - https://volleyballlife.com/tournament/36917 (SPA, loading placeholder)
  - https://volleyballlife.com/tournament/37603 (SPA)
  - https://www.volleyballlife.com/events (SPA)
- Broken / blocked registration / detail links (HTTP 403 / login wall / bot block):
  - https://reclub.co/clubs/@sf.dynasty (HTTP 403)
  - https://reclub.co/clubs/sf.dynasty (HTTP 403)
  - https://forms.gle/wXNF946NG5nqLp179 (HTTP 403)
  - https://www.instagram.com/sfdynastyvolleyball/ (HTTP 403)
- Probed paths that 404:
  - https://sfdynastyvb.com/clinics (404)
  - https://sfdynastyvb.com/contact (404)

### fvbleague

- Source URL: https://sites.google.com/view/fvbleague/
- Event count (after dedup): 3
- Broken / blocked registration / detail links (HTTP 403 / login wall / bot block):
  - https://www.facebook.com/events/26221887760766283/ (HTTP 403)
  - https://facebook.com/events/2157351711336692 (HTTP 403)
  - https://facebook.com/events/836582889465761 (HTTP 403)
  - https://facebook.com/events/1519242606215680 (HTTP 403)
  - https://www.facebook.com/events/1255850129994276/ (HTTP 403)
  - http://bit.ly/fvbl-2s-mw-rsvp-3 (HTTP 403)
  - http://bit.ly/fvbl-2s-mw-rsvp-2 (HTTP 403)
  - http://bit.ly/fvbl-4s-coed-rsvp (HTTP 403)
  - http://bit.ly/fvbl-3s-coed-rsvp (HTTP 403)
  - http://bit.ly/fvbl-2s-rc-rsvp-2 (HTTP 403)
- Probed paths that 404:
  - https://sites.google.com/view/fvbleague/upcoming-events (404)
  - https://sites.google.com/view/fvbleague/2026 (404)

## JS-rendered hosts encountered
- volleyballlife.com / tls.volleyballlife.com (Volleyball Life SPA, JS-required)
- beachvolley.app (returns 403 to anonymous fetch)
- reclub.co (403 to anonymous fetch)
- facebook.com event pages (auth-walled, 403)
- bit.ly short links (403 via WebFetch)
