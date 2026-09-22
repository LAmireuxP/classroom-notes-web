// 新建笔记时的预置模板：点一下填入编辑框，可再自由改。

export interface NoteTemplate {
  id: string
  label: string
  content: string
}

export const NOTE_TEMPLATES: NoteTemplate[] = [
  {
    id: "class",
    label: "课堂笔记",
    content: "## 知识点\n- \n\n## 例题\n- \n\n## 课后作业\n- [ ] ",
  },
  {
    id: "homework",
    label: "作业记录",
    content: "## 作业内容\n- [ ] \n\n## 卡住的题\n- \n\n## 提交日期\n- ",
  },
  {
    id: "review",
    label: "复习清单",
    content: "## 复习清单\n- [ ] 重读笔记\n- [ ] 重做例题\n- [ ] 默写关键概念\n\n## 易错点\n- ",
  },
]
