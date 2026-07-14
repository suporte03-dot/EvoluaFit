const htmlRes = await fetch('https://suporte03-dot.github.io/EvoluaFit/?t=' + Date.now())
const html = await htmlRes.text()
const m = html.match(/assets\/index-[^"']+\.(js|css)/g) || []
console.log('bundles:', m.join(', '))
const js = m.find((x) => x.endsWith('.js'))
if (js) {
  const jsRes = await fetch('https://suporte03-dot.github.io/EvoluaFit/' + js)
  const text = await jsRes.text()
  console.log('has Grupos principais:', text.includes('Grupos principais'))
  console.log('has Complementares:', text.includes('Complementares'))
  console.log('has Panturrilha:', text.includes('Panturrilha'))
  console.log('has Alongamento:', text.includes('Alongamento'))
  console.log('status', jsRes.status)
}
