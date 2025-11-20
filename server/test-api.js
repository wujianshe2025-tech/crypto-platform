// API测试脚本
// 使用方法: node test-api.js

const API_URL = process.env.API_URL || 'http://localhost:3000';

console.log('🧪 开始测试API...\n');
console.log(`API地址: ${API_URL}\n`);

// 测试健康检查
async function testHealth() {
  console.log('1️⃣ 测试健康检查...');
  try {
    const response = await fetch(`${API_URL}/health`);
    const data = await response.json();
    console.log('✅ 健康检查通过:', data);
    return true;
  } catch (error) {
    console.error('❌ 健康检查失败:', error.message);
    return false;
  }
}

// 测试根路径
async function testRoot() {
  console.log('\n2️⃣ 测试根路径...');
  try {
    const response = await fetch(`${API_URL}/`);
    const data = await response.json();
    console.log('✅ 根路径通过:', data);
    return true;
  } catch (error) {
    console.error('❌ 根路径失败:', error.message);
    return false;
  }
}

// 测试加密货币价格API
async function testCryptoPrices() {
  console.log('\n3️⃣ 测试加密货币价格API...');
  try {
    const response = await fetch(`${API_URL}/api/crypto/prices`);
    const data = await response.json();
    if (data.success && data.data.length > 0) {
      console.log('✅ 价格API通过，获取到', data.data.length, '个币种');
      console.log('   示例:', data.data[0].name, '-', data.data[0].current_price, 'USD');
      return true;
    } else {
      console.error('❌ 价格API返回数据异常');
      return false;
    }
  } catch (error) {
    console.error('❌ 价格API失败:', error.message);
    return false;
  }
}

// 测试预测列表API
async function testPredictions() {
  console.log('\n4️⃣ 测试预测列表API...');
  try {
    const response = await fetch(`${API_URL}/api/predictions`);
    const data = await response.json();
    if (data.success) {
      console.log('✅ 预测API通过，当前有', data.data.length, '个预测');
      return true;
    } else {
      console.error('❌ 预测API返回数据异常');
      return false;
    }
  } catch (error) {
    console.error('❌ 预测API失败:', error.message);
    return false;
  }
}

// 测试认证API（无token应该返回401）
async function testAuthWithoutToken() {
  console.log('\n5️⃣ 测试认证保护...');
  try {
    const response = await fetch(`${API_URL}/api/auth/me`);
    if (response.status === 401) {
      console.log('✅ 认证保护正常（未授权返回401）');
      return true;
    } else {
      console.error('❌ 认证保护异常（应该返回401）');
      return false;
    }
  } catch (error) {
    console.error('❌ 认证测试失败:', error.message);
    return false;
  }
}

// 运行所有测试
async function runAllTests() {
  const results = [];
  
  results.push(await testHealth());
  results.push(await testRoot());
  results.push(await testCryptoPrices());
  results.push(await testPredictions());
  results.push(await testAuthWithoutToken());
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log('\n' + '='.repeat(50));
  console.log(`\n📊 测试结果: ${passed}/${total} 通过\n`);
  
  if (passed === total) {
    console.log('🎉 所有测试通过！API运行正常！\n');
  } else {
    console.log('⚠️  部分测试失败，请检查服务器日志\n');
  }
}

// 执行测试
runAllTests().catch(error => {
  console.error('\n❌ 测试执行失败:', error);
  process.exit(1);
});
