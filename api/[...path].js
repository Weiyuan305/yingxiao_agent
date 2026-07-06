module.exports = async function handler(request, response) {
  const { handleRequest } = await import('../server.mjs')
  return handleRequest(request, response)
}
