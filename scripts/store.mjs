// 兼容入口：把 TypeScript 编译产物 dist/store 暴露给 server.mjs（仿 scripts/agent.mjs）。
export * from '../dist/store/index.mjs'
