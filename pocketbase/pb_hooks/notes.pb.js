/// <reference path="../pb_data/types.d.ts" />
// pb_hooks/notes.pb.js — 业务 collection + REST CRUD 路由 (self-contained)
//
// 由 mcp__rh-pb-hooks__install_business_collection 装. 不要直接 Read+Write 这个文件.
// 业务字段: title:text, content:text, course:text, pinned:bool, favorite:bool, deleted:text, last_reviewed:text
// 路由: list,get,create,update,delete
// list filter 字段: title,course
// list 默认排序: -created

onBootstrap(function (e) {
  e.next()
  try {
    var existing = null
    try { existing = $app.findCollectionByNameOrId("notes") } catch (_) { existing = null }
    if (existing) {
      var changed = false
      function hasField(name) {
        try { return !!existing.fields.getByName(name) } catch (_) {}
        try {
          for (var i = 0; i < existing.fields.length; i++) {
            if (String(existing.fields[i].name) === String(name)) return true
          }
        } catch (_) {}
        return false
      }
      function addField(def) {
        if (hasField(def.name)) return
        try { existing.fields.add(new Field(def)); changed = true } catch (_) {}
      }
      addField({ name: 'title', type: 'text', required: true })
      addField({ name: 'content', type: 'text', required: true })
      addField({ name: 'course', type: 'text' })
      addField({ name: 'pinned', type: 'bool' })
      addField({ name: 'favorite', type: 'bool' })
      addField({ name: 'deleted', type: 'text' })
      addField({ name: 'last_reviewed', type: 'text' })
      addField({ name: "created", type: "autodate", onCreate: true })
      addField({ name: "updated", type: "autodate", onCreate: true, onUpdate: true })
      if (changed) {
        $app.save(existing)
        try { $app.logger().info("notes collection upgraded") } catch (_) {}
      }
    } else {
      var col = new Collection({
        type: "base",
        name: "notes",
        listRule: null, viewRule: null, createRule: null, updateRule: null, deleteRule: null,
        fields: [
          { name: 'title', type: 'text', required: true },
          { name: 'content', type: 'text', required: true },
          { name: 'course', type: 'text' },
          { name: 'pinned', type: 'bool' },
          { name: 'favorite', type: 'bool' },
          { name: 'deleted', type: 'text' },
          { name: 'last_reviewed', type: 'text' },
          { name: "created", type: "autodate", onCreate: true },
          { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
        ],
      })
      $app.save(col)
      try { $app.logger().info("notes collection created") } catch (_) {}
    }
  } catch (err) {
    try { $app.logger().error("notes bootstrap: " + String(err && err.message || err)) } catch (_) {}
  }
})

// GET /api/notes?page=1&perPage=50&sort=-created&title=...&course=...
routerAdd("GET", "/api/notes", function (e) {
  function ensureCollLocal() {
    try { return $app.findCollectionByNameOrId("notes") } catch (_) {}
    var col = new Collection({
      type: "base",
      name: "notes",
      listRule: null, viewRule: null, createRule: null, updateRule: null, deleteRule: null,
      fields: [
          { name: 'title', type: 'text', required: true },
          { name: 'content', type: 'text', required: true },
          { name: 'course', type: 'text' },
          { name: 'pinned', type: 'bool' },
          { name: 'favorite', type: 'bool' },
          { name: 'deleted', type: 'text' },
          { name: 'last_reviewed', type: 'text' },
        { name: "created", type: "autodate", onCreate: true },
        { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
      ],
    })
    $app.save(col)
    return $app.findCollectionByNameOrId("notes")
  }
  try {
    ensureCollLocal()
    var info = e.requestInfo()
    var query = info.query || {}
    var page = parseInt(String(query.page || "1"), 10) || 1
    var perPage = parseInt(String(query.perPage || "50"), 10) || 50
    if (perPage > 200) perPage = 200
    var sort = String(query.sort || "-created")
    var filterParts = []
    var params = {}
    if (query.title !== undefined && query.title !== "") {
      filterParts.push("title = {:title}")
      params.title = String(query.title)
    }
    if (query.course !== undefined && query.course !== "") {
      filterParts.push("course = {:course}")
      params.course = String(query.course)
    }
    var filter = filterParts.length > 0 ? filterParts.join(" && ") : ""
    var records = filter
      ? $app.findRecordsByFilter("notes", filter, sort, perPage, (page - 1) * perPage, params)
      : $app.findRecordsByFilter("notes", "", sort, perPage, (page - 1) * perPage)
    var items = []
    for (var i = 0; i < records.length; i++) {
      items.push(records[i].publicExport())
    }
    return e.json(200, { items: items, page: page, perPage: perPage, totalItems: items.length })
  } catch (err) {
    var msg = String(err && err.message || err)
    try { $app.logger().error("notes list: " + msg) } catch (_) {}
    return e.json(500, { error: "list_failed", message: msg, fingerprint: msg.substring(0, 80) })
  }
})
// GET /api/notes/{id}
routerAdd("GET", "/api/notes/{id}", function (e) {
  try {
    var id = e.request.pathValue("id")
    if (!id) return e.json(400, { error: "id_required" })
    var rec = null
    try { rec = $app.findRecordById("notes", id) } catch (_) { rec = null }
    if (!rec) return e.json(404, { error: "not_found" })
    return e.json(200, rec.publicExport())
  } catch (err) {
    var msg = String(err && err.message || err)
    return e.json(500, { error: "get_failed", message: msg, fingerprint: msg.substring(0, 80) })
  }
})
// POST /api/notes  body 字段: title, content, course, pinned, favorite, deleted, last_reviewed
routerAdd("POST", "/api/notes", function (e) {
  function ensureCollLocal() {
    try { return $app.findCollectionByNameOrId("notes") } catch (_) {}
    var col = new Collection({
      type: "base",
      name: "notes",
      listRule: null, viewRule: null, createRule: null, updateRule: null, deleteRule: null,
      fields: [
          { name: 'title', type: 'text', required: true },
          { name: 'content', type: 'text', required: true },
          { name: 'course', type: 'text' },
          { name: 'pinned', type: 'bool' },
          { name: 'favorite', type: 'bool' },
          { name: 'deleted', type: 'text' },
          { name: 'last_reviewed', type: 'text' },
        { name: "created", type: "autodate", onCreate: true },
        { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
      ],
    })
    $app.save(col)
    return $app.findCollectionByNameOrId("notes")
  }
  try {
    var coll = ensureCollLocal()
    var body = e.requestInfo().body || {}
    var rec = new Record(coll)
    rec.set("title", body.title === undefined || body.title === null ? "" : String(body.title))
    rec.set("content", body.content === undefined || body.content === null ? "" : String(body.content))
    rec.set("course", body.course === undefined || body.course === null ? "" : String(body.course))
    rec.set("pinned", !!body.pinned)
    rec.set("favorite", !!body.favorite)
    rec.set("deleted", body.deleted === undefined || body.deleted === null ? "" : String(body.deleted))
    rec.set("last_reviewed", body.last_reviewed === undefined || body.last_reviewed === null ? "" : String(body.last_reviewed))
    $app.save(rec)
    return e.json(200, rec.publicExport())
  } catch (err) {
    var msg = String(err && err.message || err)
    try { $app.logger().error("notes create: " + msg) } catch (_) {}
    return e.json(500, { error: "create_failed", message: msg, fingerprint: msg.substring(0, 80) })
  }
})
// PATCH /api/notes/{id}  body 字段同 POST, 只更新 body 里出现的字段
routerAdd("PATCH", "/api/notes/{id}", function (e) {
  try {
    var id = e.request.pathValue("id")
    if (!id) return e.json(400, { error: "id_required" })
    var rec = null
    try { rec = $app.findRecordById("notes", id) } catch (_) { rec = null }
    if (!rec) return e.json(404, { error: "not_found" })
    var body = e.requestInfo().body || {}
    if ("title" in body) rec.set("title", body.title === undefined || body.title === null ? "" : String(body.title))
    if ("content" in body) rec.set("content", body.content === undefined || body.content === null ? "" : String(body.content))
    if ("course" in body) rec.set("course", body.course === undefined || body.course === null ? "" : String(body.course))
    if ("pinned" in body) rec.set("pinned", !!body.pinned)
    if ("favorite" in body) rec.set("favorite", !!body.favorite)
    if ("deleted" in body) rec.set("deleted", body.deleted === undefined || body.deleted === null ? "" : String(body.deleted))
    if ("last_reviewed" in body) rec.set("last_reviewed", body.last_reviewed === undefined || body.last_reviewed === null ? "" : String(body.last_reviewed))
    $app.save(rec)
    return e.json(200, rec.publicExport())
  } catch (err) {
    var msg = String(err && err.message || err)
    return e.json(500, { error: "update_failed", message: msg, fingerprint: msg.substring(0, 80) })
  }
})
// DELETE /api/notes/{id}
routerAdd("DELETE", "/api/notes/{id}", function (e) {
  try {
    var id = e.request.pathValue("id")
    if (!id) return e.json(400, { error: "id_required" })
    var rec = null
    try { rec = $app.findRecordById("notes", id) } catch (_) { rec = null }
    if (!rec) return e.json(404, { error: "not_found" })
    $app.delete(rec)
    return e.json(200, { ok: true })
  } catch (err) {
    var msg = String(err && err.message || err)
    return e.json(500, { error: "delete_failed", message: msg, fingerprint: msg.substring(0, 80) })
  }
})
