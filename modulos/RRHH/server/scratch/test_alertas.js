import fetch from 'node-fetch'

async function testAlerts() {
  try {
    const res = await fetch('http://localhost:5002/api/rrhh/vacaciones/alertas')
    console.log('Status:', res.status)
    const json = await res.json()
    console.log('Response:')
    console.log(JSON.stringify(json, null, 2))
    process.exit(0)
  } catch (err) {
    console.error('Error fetching alerts:', err.message)
    process.exit(1)
  }
}

testAlerts()
