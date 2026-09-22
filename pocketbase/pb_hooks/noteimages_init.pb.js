/// <reference path="../pb_data/types.d.ts" />
// 笔记配图：确保 noteimages 集合存在（file 字段），上传/读取全部走 PocketBase
// 标准 REST + /api/files 通路（前端 FormData），本文件只提供一次启动初始化。
// 说明：业务表 MCP 不支持 file 字段，故这张"纯文件表"用启动钩子建，无任何自定义路由。
onBootstrap(function (e) {
  e.next()
  try {
    var existing = null
    try { existing = $app.findCollectionByNameOrId("noteimages") } catch (_) { existing = null }
    if (!existing) {
      var col = new Collection({
        type: "base",
        name: "noteimages",
        listRule: null, viewRule: null, createRule: "", updateRule: null, deleteRule: null,
        fields: [
          { name: "created", type: "autodate", onCreate: true },
          { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
          {
            name: "image",
            type: "file",
            maxSelect: 1,
            maxSize: 5242880,
            mimeTypes: ["image/png", "image/jpeg", "image/webp", "image/gif"],
            thumbs: ["800x0"],
            protected: false,
          },
        ],
      })
      $app.save(col)
      try { $app.logger().info("noteimages collection created") } catch (_) {}
    }
  } catch (err) {
    try { $app.logger().error("noteimages bootstrap: " + String(err && err.message || err)) } catch (_) {}
  }
})
