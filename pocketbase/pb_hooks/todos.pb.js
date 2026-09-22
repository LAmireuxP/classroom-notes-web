/// <reference path="../pb_data/types.d.ts" />
// pb_hooks/todos.pb.js — 业务 collection + REST CRUD 路由 (self-contained)
//
// 由 mcp__rh-pb-hooks__install_business_collection 装. 不要直接 Read+Write 这个文件.
// 业务字段: content:text, done:bool, due:text
// 路由: list,get,create,update,delete
// list filter 字段: done
// list 默认排序: -created

onBootstrap(function (e) {
  e.next()
  try {
    var existing = null
    try { existing = $app.findCollectionByNameOrId("todos") } catch (_) { existing = null }
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
      addField({ name: 'content', type: 'text', required: true })
      addField({ name: 'done', type: 'bool' })
      addField({ name: 'due', type: 'text', max: 10 })
      addField({ name: "created", type: "autodate", onCreate: true })
      addField({ name: "updated", type: "autodate", onCreate: true, onUpdate: true })
      if (changed) {
        $app.save(existing)
        try { $app.logger().info("todos collection upgraded") } catch (_) {}
      }
    } else {
      var col = new Collection({
        type: "base",
        name: "todos",
        listRule: null, viewRule: null, createRule: null, updateRule: null, deleteRule: null,
        fields: [
          { name: 'content', type: 'text', required: true },
          { name: 'done', type: 'bool' },
          { name: 'due', type: 'text', max: 10 },
          { name: "created", type: "autodate", onCreate: true },
          { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
        ],
      })
      $app.save(col)
      try { $app.logger().info("todos collection created") } catch (_) {}
    }
  } catch (err) {
    try { $app.logger().error("todos bootstrap: " + String(err && err.message || err)) } catch (_) {}
  }
})

// GET /api/todos?page=1&perPage=50&sort=-created&done=...
routerAdd("GET", "/api/todos", function (e) {
  function ensureCollLocal() {
    try { return $app.findCollectionByNameOrId("todos") } catch (_) {}
    var col = new Collection({
      type: "base",
      name: "todos",
      listRule: null, viewRule: null, createRule: null, updateRule: null, deleteRule: null,
      fields: [
          { name: 'content', type: 'text', required: true },
          { name: 'done', type: 'bool' },
          { name: 'due', type: 'text', max: 10 },
        { name: "created", type: "autodate", onCreate: true },
        { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
      ],
    })
    $app.save(col)
    return $app.findCollectionByNameOrId("todos")
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
    if (query.done !== undefined && query.done !== "") {
      filterParts.push("done = {:done}")
      params.done = String(query.done)
    }
    var filter = filterParts.length > 0 ? filterParts.join(" && ") : ""
    var records = filter
      ? $app.findRecordsByFilter("todos", filter, sort, perPage, (page - 1) * perPage, params)
      : $app.findRecordsByFilter("todos", "", sort, perPage, (page - 1) * perPage)
    var items = []
    for (var i = 0; i < records.length; i++) {
      items.push(records[i].publicExport())
    }
    return e.json(200, { items: items, page: page, perPage: perPage, totalItems: items.length })
  } catch (err) {
    var msg = String(err && err.message || err)
    try { $app.logger().error("todos list: " + msg) } catch (_) {}
    return e.json(500, { error: "list_failed", message: msg, fingerprint: msg.substring(0, 80) })
  }
})
// GET /api/todos/{id}
routerAdd("GET", "/api/todos/{id}", function (e) {
  try {
    var id = e.request.pathValue("id")
    if (!id) return e.json(400, { error: "id_required" })
    var rec = null
    try { rec = $app.findRecordById("todos", id) } catch (_) { rec = null }
    if (!rec) return e.json(404, { error: "not_found" })
    return e.json(200, rec.publicExport())
  } catch (err) {
    var msg = String(err && err.message || err)
    return e.json(500, { error: "get_failed", message: msg, fingerprint: msg.substring(0, 80) })
  }
})
// POST /api/todos  body 字段: content, done, due
routerAdd("POST", "/api/todos", function (e) {
  function ensureCollLocal() {
    try { return $app.findCollectionByNameOrId("todos") } catch (_) {}
    var col = new Collection({
      type: "base",
      name: "todos",
      listRule: null, viewRule: null, createRule: null, updateRule: null, deleteRule: null,
      fields: [
          { name: 'content', type: 'text', required: true },
          { name: 'done', type: 'bool' },
          { name: 'due', type: 'text', max: 10 },
        { name: "created", type: "autodate", onCreate: true },
        { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
      ],
    })
    $app.save(col)
    return $app.findCollectionByNameOrId("todos")
  }
  try {
    var coll = ensureCollLocal()
    var body = e.requestInfo().body || {}
    var rec = new Record(coll)
    rec.set("content", body.content === undefined || body.content === null ? "" : String(body.content))
    rec.set("done", !!body.done)
    rec.set("due", body.due === undefined || body.due === null ? "" : String(body.due))
    $app.save(rec)
    return e.json(200, rec.publicExport())
  } catch (err) {
    var msg = String(err && err.message || err)
    try { $app.logger().error("todos create: " + msg) } catch (_) {}
    return e.json(500, { error: "create_failed", message: msg, fingerprint: msg.substring(0, 80) })
  }
})
// PATCH /api/todos/{id}  body 字段同 POST, 只更新 body 里出现的字段
routerAdd("PATCH", "/api/todos/{id}", function (e) {
  try {
    var id = e.request.pathValue("id")
    if (!id) return e.json(400, { error: "id_required" })
    var rec = null
    try { rec = $app.findRecordById("todos", id) } catch (_) { rec = null }
    if (!rec) return e.json(404, { error: "not_found" })
    var body = e.requestInfo().body || {}
    if ("content" in body) rec.set("content", body.content === undefined || body.content === null ? "" : String(body.content))
    if ("done" in body) rec.set("done", !!body.done)
    if ("due" in body) rec.set("due", body.due === undefined || body.due === null ? "" : String(body.due))
    $app.save(rec)
    return e.json(200, rec.publicExport())
  } catch (err) {
    var msg = String(err && err.message || err)
    return e.json(500, { error: "update_failed", message: msg, fingerprint: msg.substring(0, 80) })
  }
})
// DELETE /api/todos/{id}
routerAdd("DELETE", "/api/todos/{id}", function (e) {
  try {
    var id = e.request.pathValue("id")
    if (!id) return e.json(400, { error: "id_required" })
    var rec = null
    try { rec = $app.findRecordById("todos", id) } catch (_) { rec = null }
    if (!rec) return e.json(404, { error: "not_found" })
    $app.delete(rec)
    return e.json(200, { ok: true })
  } catch (err) {
    var msg = String(err && err.message || err)
    return e.json(500, { error: "delete_failed", message: msg, fingerprint: msg.substring(0, 80) })
  }
})
