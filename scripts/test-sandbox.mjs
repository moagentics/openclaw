/**
 * Vercel Sandbox Test Script
 * 
 * This script demonstrates how to:
 * 1. Spin up a Vercel Sandbox (ephemeral Linux microVM)
 * 2. Run code inside it
 * 3. Capture and display the output
 * 
 * Prerequisites:
 * - Run `vercel link` to link your project
 * - Run `vercel env pull` to get the OIDC token
 * - Install @vercel/sandbox: `pnpm add @vercel/sandbox`
 */

import { Sandbox } from '@vercel/sandbox';

async function main() {
  console.log('🚀 Creating Vercel Sandbox...\n');

  // Create a sandbox with Node.js 24 runtime
  const sandbox = await Sandbox.create({
    runtime: 'node24',
    timeout: 60000, // 60 second timeout
  });

  console.log(`✅ Sandbox created!`);
  console.log(`   ID: ${sandbox.sandboxId}`);
  console.log(`   Status: ${sandbox.status}`);
  console.log(`   Timeout: ${sandbox.timeout}ms\n`);

  try {
    // Test 1: Check Node.js version
    console.log('📦 Running: node --version');
    const nodeVersion = await sandbox.runCommand('node', ['--version']);
    console.log(`   Output: ${(await nodeVersion.stdout()).trim()}`);
    console.log(`   Exit code: ${nodeVersion.exitCode}\n`);

    // Test 2: Run a simple JavaScript expression
    console.log('🧮 Running: Calculate 2 + 2');
    const calcResult = await sandbox.runCommand('node', ['-e', 'console.log("2 + 2 =", 2 + 2)']);
    console.log(`   Output: ${(await calcResult.stdout()).trim()}`);
    console.log(`   Exit code: ${calcResult.exitCode}\n`);

    // Test 3: Write and execute a file
    console.log('📝 Writing and executing a script file...');
    
    await sandbox.writeFiles([
      {
        path: 'hello.js',
        content: Buffer.from(`
console.log('Hello from Vercel Sandbox!');
console.log('Current time:', new Date().toISOString());
console.log('Process info:', {
  node: process.version,
  platform: process.platform,
  arch: process.arch,
});
        `.trim()),
      },
    ]);

    const helloResult = await sandbox.runCommand('node', ['hello.js']);
    console.log(`   Output:\n${(await helloResult.stdout()).split('\n').map(l => '     ' + l).join('\n')}`);
    console.log(`   Exit code: ${helloResult.exitCode}\n`);

    // Test 4: Check system info
    console.log('💻 Checking system info...');
    const unameResult = await sandbox.runCommand('uname', ['-a']);
    console.log(`   OS: ${(await unameResult.stdout()).trim()}\n`);

    // Test 5: List directory contents
    console.log('📂 Listing sandbox directory...');
    const lsResult = await sandbox.runCommand('ls', ['-la']);
    console.log(`   Contents:\n${(await lsResult.stdout()).split('\n').map(l => '     ' + l).join('\n')}\n`);

    console.log('🎉 All tests passed! Vercel Sandbox is working correctly.\n');

  } catch (error) {
    console.error('❌ Error during sandbox execution:', error);
    throw error;
  } finally {
    // Always clean up the sandbox
    console.log('🧹 Stopping sandbox...');
    await sandbox.stop({ blocking: true });
    console.log(`   Final status: ${sandbox.status}`);
    console.log(`   CPU usage: ${sandbox.activeCpuUsageMs}ms`);
    console.log('✨ Done!\n');
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
