// seed.js — 初始化示例数据
// 用法: node seed.js
require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const TASKS = [
  { title: "配置防火墙规则", description: "更新 iptables 规则以阻止未授权访问", group_name: "安全", priority: 3, completed: false },
  { title: "审计系统日志", description: "检查 /var/log/auth.log 中的可疑活动", group_name: "安全", priority: 2, completed: false },
  { title: "部署入侵检测系统", description: "安装并配置 OSSEC", group_name: "安全", priority: 2, completed: true },
  { title: "升级 SSH 密钥", description: "从 RSA 2048 升级到 Ed25519", group_name: "安全", priority: 1, completed: false },
  { title: "备份数据库", description: "执行每日自动备份脚本 cron_backup.sh", group_name: "运维", priority: 2, completed: true },
  { title: "监控服务器负载", description: "配置 Prometheus + Grafana 监控面板", group_name: "运维", priority: 1, completed: false },
  { title: "清理磁盘空间", description: "删除过期的 Docker 镜像和日志文件", group_name: "运维", priority: 3, completed: true },
  { title: "优化 API 响应速度", description: "目标: P99 延迟 < 200ms", group_name: "开发", priority: 3, completed: false },
  { title: "实现 WebSocket 通信", description: "实时通知推送功能", group_name: "开发", priority: 2, completed: false },
  { title: "编写单元测试", description: "覆盖率目标 > 85%", group_name: "开发", priority: 1, completed: true },
  { title: "代码审查", description: "审查 PR #42-#47", group_name: "开发", priority: 2, completed: false },
  { title: "分析网络流量", description: "使用 Wireshark 检查异常数据包", group_name: "渗透", priority: 3, completed: false },
  { title: "扫描开放端口", description: "nmap -sS -sV 目标网络段", group_name: "渗透", priority: 3, completed: false },
  { title: "社会工程测试报告", description: "钓鱼邮件演练总结", group_name: "渗透", priority: 1, completed: true },
  { title: "解密 intercepted 数据", description: "使用 AES-256 解密捕获的流量", group_name: "渗透", priority: 2, completed: false },
];

const NOTES = [
  { title: "系统架构笔记", content: "微服务架构:\n- API Gateway: Kong\n- Auth: JWT + OAuth2\n- DB: PostgreSQL + Redis\n- MQ: RabbitMQ", color: "#00ff41" },
  { title: "常用命令速查", content: "netstat -tulnp  # 查看端口\ndf -h            # 磁盘空间\nhtop             # 进程监控\njournalctl -f    # 系统日志", color: "#00e5ff" },
  { title: "安全检查清单", content: "□ 更新所有系统补丁\n□ 检查开放端口\n□ 审查用户权限\n□ 验证备份完整性\n□ 测试灾难恢复流程", color: "#ff0040" },
];

async function seed() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 清空旧数据
    await client.query("DELETE FROM tasks");
    await client.query("DELETE FROM notes");

    // 插入任务
    for (const t of TASKS) {
      await client.query(
        "INSERT INTO tasks (title, description, completed, group_name, priority) VALUES ($1, $2, $3, $4, $5)",
        [t.title, t.description, t.completed, t.group_name, t.priority]
      );
    }

    // 插入笔记
    for (const n of NOTES) {
      await client.query(
        "INSERT INTO notes (title, content, color) VALUES ($1, $2, $3)",
        [n.title, n.content, n.color]
      );
    }

    await client.query("COMMIT");
    console.log("✅ 种子数据插入成功！");
    console.log(`   - ${TASKS.length} 条任务`);
    console.log(`   - ${NOTES.length} 条笔记`);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ 插入失败:", err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
