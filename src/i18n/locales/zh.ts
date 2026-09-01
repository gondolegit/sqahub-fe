export default {
  "common": {
    "cancel": "取消",
    "save": "保存",
    "delete": "删除",
    "edit": "编辑",
    "close": "关闭",
    "back": "返回",
    "confirm": "确认",
    "actions": "操作",
    "search": "搜索",
    "loading": "加载中...",
    "yes": "是",
    "no": "否",
    "apiKeys": "API 密钥",
    "or": "或"
  },
  "language": {
    "id": "印尼语",
    "en": "英语",
    "zh": "中文",
    "switchLabel": "切换语言"
  },
  "nav": {
    "dashboard": "仪表盘",
    "projects": "项目",
    "testSuites": "测试套件",
    "qualityDashboard": "质量仪表盘",
    "apiKeys": "API 密钥",
    "activityLog": "活动日志"
  },
  "header": {
    "openMenu": "打开导航菜单",
    "closeMenu": "关闭导航菜单",
    "logout": "退出登录"
  },
  "auth": {
    "login": {
      "brand": "SQAHUB",
      "subtitle": "登录以访问质量仪表盘",
      "usernameLabel": "用户名",
      "usernamePlaceholder": "请输入用户名",
      "passwordLabel": "密码",
      "passwordPlaceholder": "********",
      "forgotPassword": "忘记密码？",
      "submit": "登录 SQAHub",
      "loggingIn": "正在登录……正在跳转……",
      "googleButton": "使用 Google 登录",
      "noAccount": "还没有账号？立即注册",
      "backToLanding": "返回首页",
      "errorGeneric": "登录失败，请检查您的用户名和密码。",
      "registrationSuccess": "{{username}} 注册成功，请登录。"
    },
    "register": {
      "title": "注册 SQAHub",
      "subtitle": "创建您的账号并选择您在团队中的角色。",
      "usernameLabel": "用户名",
      "nameLabel": "姓名",
      "emailLabel": "电子邮箱",
      "passwordLabel": "密码",
      "roleLabel": "角色",
      "rolePlaceholder": "选择角色",
      "roleTester": "测试员",
      "roleDeveloper": "开发者",
      "submit": "创建账号",
      "googleButton": "使用 Google 注册",
      "haveAccount": "已有账号？点击登录。",
      "backToHome": "返回首页",
      "successGeneric": "注册成功！即将跳转至登录页面。",
      "errorGeneric": "注册失败，请重试。",
      "errorConnection": "无法连接到服务器，请确认 API 是否正在运行。"
    },
    "forgotPassword": {
      "title": "忘记密码？",
      "subtitle": "SQAHub 使用用户名登录，但密码重置链接会发送到您的<bold>账号邮箱</bold>——请输入注册时使用的邮箱，如果该邮箱已注册，我们将发送重置链接。",
      "emailLabel": "注册邮箱",
      "emailPlaceholder": "name@company.com",
      "emailHint": "不是您的登录用户名，请使用注册时的电子邮箱地址。",
      "submit": "发送重置链接",
      "backToLogin": "返回登录",
      "sentMessage": "如果 <bold>{{email}}</bold> 已注册，我们已将密码重置说明发送至该邮箱，也请检查垃圾邮件文件夹。",
      "errorGeneric": "发送请求失败，请稍后重试。"
    },
    "resetPassword": {
      "title": "重置密码",
      "subtitle": "为您的账号创建新密码。",
      "incompleteLink": "重置链接不完整，请重新打开邮件中的链接。",
      "requestNewLink": "获取新链接",
      "successMessage": "密码更新成功，正在跳转至登录页面……",
      "newPasswordLabel": "新密码",
      "newPasswordPlaceholder": "至少 8 个字符",
      "confirmPasswordLabel": "确认密码",
      "confirmPasswordPlaceholder": "请再次输入新密码",
      "submit": "保存新密码",
      "backToLogin": "返回登录",
      "errorMinLength": "密码至少需要 {{min}} 个字符。",
      "errorMismatch": "两次输入的密码不一致。",
      "errorGeneric": "重置链接无效或已过期。"
    },
    "oauth2Redirect": {
      "completing": "正在完成 Google 登录……",
      "failedTitle": "Google 登录失败",
      "backToLogin": "返回登录",
      "incompleteResponse": "Google 返回的信息不完整，请重试。"
    }
  },
  "dashboard": {
    "welcomeBack": "欢迎回来，",
    "quickLinks": {
      "projectsTitle": "项目",
      "projectsDescription": "管理您所有的测试项目",
      "testSuitesTitle": "测试套件",
      "testSuitesDescription": "查看执行历史并开始新的测试运行",
      "qualityDashboardTitle": "质量仪表盘",
      "qualityDashboardDescription": "各项目的通过率趋势与测试用例覆盖情况",
      "apiKeysTitle": "API 密钥",
      "apiKeysDescription": "与 Katalon、Jenkins 等工具集成。",
      "activityLogTitle": "活动日志",
      "activityLogDescription": "审计所有系统活动"
    },
    "recentProjects": {
      "title": "最近的项目",
      "subtitle": "最近更新的项目",
      "viewAll": "查看全部",
      "empty": "暂无项目，请先创建您的第一个项目。",
      "noDescription": "暂无描述"
    }
  },
  "notFound": {
    "title": "页面未找到",
    "description": "抱歉，我们找不到您要访问的页面。您是否输错了地址？",
    "backToDashboard": "返回仪表盘"
  },
  "projects": {
    "title": "项目中心",
    "subtitle": "管理并监控您所有的测试自动化系统。",
    "newProject": "新建项目",
    "searchPlaceholder": "在此页面搜索项目……",
    "manageTeam": "管理团队",
    "noDescription": "暂无描述。",
    "features": "功能",
    "emptySearchTitle": "未找到结果",
    "emptySearchHint": "请尝试其他关键词。",
    "emptyTitle": "暂无项目",
    "emptyHint": "立即创建您的第一个项目吧。",
    "createFirst": "创建项目",
    "errorLoading": "数据加载失败，请检查您的 API 连接。",
    "deleteConfirmTitle": "删除项目？",
    "deleteConfirmDescription": "「{{name}}」将被永久删除。",
    "deleteConfirmAction": "删除",
    "deleteSuccess": "已删除",
    "deleteError": "操作失败",
    "status": {
      "active": "进行中",
      "completed": "已完成",
      "suspended": "已暂停",
      "archived": "已归档",
      "maintenance": "维护中"
    }
  }
} as const;
