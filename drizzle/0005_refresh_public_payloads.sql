UPDATE content_records
SET payload = '{"slug":"hatta-yoichi","name":"八田 與一","reading":"はった よいち","status":"公開手配中","classification":"警察庁指定重要指名手配","agency":"大分県警察","prefecture":"大分県","lastVerified":"2026-08-23","height":"175cm位","features":["中肉","黒色短髪（公開写真撮影時）"],"charges":"殺人・殺人未遂・道路交通法違反","caseSlugs":["beppu-university-students"],"sourceIds":["npa-important-2025","oita-hatta","oita-wanted"],"officialPhotoSourceId":"npa-important-2025","timeline":[{"date":"2022-06-29","title":"事件発生","description":"別府市内で大学生2名に対する殺人等事件が発生。","sourceId":"oita-hatta"},{"date":"2023-09","title":"重要指名手配に指定","description":"警察庁指定重要指名手配被疑者として掲載。","sourceId":"npa-important-2025"}]}',
    revision = revision + 1,
    updated_at = CURRENT_TIMESTAMP
WHERE id = 'wanted:hatta-yoichi';--> statement-breakpoint

UPDATE content_records
SET payload = '{"slug":"mitate-shinichi","name":"見立 真一","reading":"みたて しんいち","status":"公開手配中","classification":"警察庁指定重要指名手配","agency":"警視庁","prefecture":"東京都","lastVerified":"2026-08-23","height":"167cm位","features":["がっちり","創痕（右前腕、左目上、前頭部、額部）"],"charges":"殺人・凶器準備集合","caseSlugs":["roppongi-building-case"],"sourceIds":["npa-important-2025","mpd-roppongi"],"officialPhotoSourceId":"mpd-roppongi","timeline":[{"date":"2012-09-02","title":"事件発生","description":"六本木五丁目の飲食店内で事件が発生。","sourceId":"mpd-roppongi"},{"date":"2026-08-23","title":"公式掲載を確認","description":"公式公開ページの掲載状態を確認。","sourceId":"npa-important-2025"}]}',
    revision = revision + 1,
    updated_at = CURRENT_TIMESTAMP
WHERE id = 'wanted:mitate-shinichi';--> statement-breakpoint

UPDATE content_records
SET payload = '{"slug":"lin-shaowei","name":"リン ショウイ","reading":"りん しょうい","status":"公開手配中","classification":"警察庁指定重要指名手配","agency":"愛知県警察","prefecture":"愛知県","lastVerified":"2026-08-23","height":"178cm位","features":["公式公開ページに掲載された特徴のみ参照"],"charges":"強盗殺人","caseSlugs":["aichi-robbery-murder"],"sourceIds":["npa-important-2025"],"officialPhotoSourceId":"npa-important-2025","timeline":[{"date":"2026-08-23","title":"公式掲載を確認","description":"警察庁の重要指名手配一覧で掲載状態を確認。","sourceId":"npa-important-2025"}]}',
    revision = revision + 1,
    updated_at = CURRENT_TIMESTAMP
WHERE id = 'wanted:lin-shaowei';--> statement-breakpoint

UPDATE content_records
SET payload = '{"id":"p1","subject":"hatta-yoichi","caseSlug":"beppu-university-students","label":"事件発生地点付近（公開用概略）","lat":33.279,"lon":131.5,"date":"2022-06-29","confidence":"HIGH","source":"verified_source","recordType":"official_event","geographicPrecision":"city","temporalPrecision":"day","direction":45}',
    revision = revision + 1,
    updated_at = CURRENT_TIMESTAMP
WHERE id = 'map:p1';--> statement-breakpoint

UPDATE content_records
SET payload = '{"id":"p2","subject":"mitate-shinichi","caseSlug":"roppongi-building-case","label":"事件発生地点付近（公開用概略）","lat":35.662,"lon":139.733,"date":"2012-09-02","confidence":"HIGH","source":"verified_source","recordType":"official_event","geographicPrecision":"city","temporalPrecision":"day","direction":0}',
    revision = revision + 1,
    updated_at = CURRENT_TIMESTAMP
WHERE id = 'map:p2';--> statement-breakpoint

UPDATE content_records
SET payload = '{"id":"p3","subject":"lin-shaowei","caseSlug":"aichi-robbery-murder","label":"手配元地域（都道府県単位）","lat":35.18,"lon":136.907,"date":"2025-11-01","confidence":"MED","source":"verified_source","recordType":"verified_record","geographicPrecision":"prefecture","temporalPrecision":"month","direction":270}',
    revision = revision + 1,
    updated_at = CURRENT_TIMESTAMP
WHERE id = 'map:p3';
