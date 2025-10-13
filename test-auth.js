// Simple test script for authentication API
const fetch = require('node-fetch')
const BASE_URL = 'http://localhost:3000'

async function testAuth() {
  console.log('🧪 Testing Authentication System...\n')

  // Test 1: Register a new user
  console.log('1. Testing user registration...')
  try {
    const registerResponse = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'TestPassword123',
        confirmPassword: 'TestPassword123',
      }),
    })

    const registerData = await registerResponse.json()
    console.log('Registration response:', registerData)
    
    if (registerResponse.ok) {
      console.log('✅ Registration successful')
    } else {
      console.log('❌ Registration failed:', registerData.error)
    }
  } catch (error) {
    console.log('❌ Registration error:', error.message)
  }

  console.log('\n2. Testing user login...')
  try {
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'TestPassword123',
      }),
    })

    const loginData = await loginResponse.json()
    console.log('Login response:', loginData)
    
    if (loginResponse.ok) {
      console.log('✅ Login successful')
      
      // Extract cookies for further testing
      const cookies = loginResponse.headers.get('set-cookie')
      console.log('Cookies received:', cookies)
    } else {
      console.log('❌ Login failed:', loginData.error)
    }
  } catch (error) {
    console.log('❌ Login error:', error.message)
  }

  console.log('\n3. Testing password validation...')
  try {
    const weakPasswordResponse = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User 2',
        email: 'test2@example.com',
        password: 'weak',
        confirmPassword: 'weak',
      }),
    })

    const weakPasswordData = await weakPasswordResponse.json()
    
    if (!weakPasswordResponse.ok) {
      console.log('✅ Password validation working:', weakPasswordData.error)
    } else {
      console.log('❌ Password validation failed - weak password accepted')
    }
  } catch (error) {
    console.log('❌ Password validation test error:', error.message)
  }

  console.log('\n4. Testing duplicate email registration...')
  try {
    const duplicateResponse = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User Duplicate',
        email: 'test@example.com', // Same email as before
        password: 'TestPassword123',
        confirmPassword: 'TestPassword123',
      }),
    })

    const duplicateData = await duplicateResponse.json()
    
    if (!duplicateResponse.ok) {
      console.log('✅ Duplicate email protection working:', duplicateData.error)
    } else {
      console.log('❌ Duplicate email protection failed')
    }
  } catch (error) {
    console.log('❌ Duplicate email test error:', error.message)
  }

  console.log('\n🎉 Authentication tests completed!')
}

// Run the tests
testAuth().catch(console.error)
