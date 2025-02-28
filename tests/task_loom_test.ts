import {
  Clarinet,
  Tx,
  Chain,
  Account,
  types
} from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
  name: "Test task creation",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const user1 = accounts.get('wallet_1')!;
    
    let block = chain.mineBlock([
      Tx.contractCall('task-loom', 'create-task',
        [
          types.ascii("Test Task"),
          types.ascii("Task Description"),
          types.principal(user1.address),
          types.uint(1677689600)
        ],
        deployer.address
      )
    ]);
    
    assertEquals(block.receipts.length, 1);
    block.receipts[0].result.expectOk().expectUint(1);
    
    const taskResponse = chain.callReadOnlyFn(
      'task-loom',
      'get-task',
      [types.uint(1)],
      deployer.address
    );
    
    const task = taskResponse.result.expectOk().expectSome();
    assertEquals(task.data['title'].data, "Test Task");
    assertEquals(task.data['assignee'].data, user1.address);
  }
});

Clarinet.test({
  name: "Test task status update",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const user1 = accounts.get('wallet_1')!;
    
    // Create task first
    chain.mineBlock([
      Tx.contractCall('task-loom', 'create-task',
        [
          types.ascii("Test Task"),
          types.ascii("Task Description"),
          types.principal(user1.address),
          types.uint(1677689600)
        ],
        deployer.address
      )
    ]);
    
    // Update status
    let block = chain.mineBlock([
      Tx.contractCall('task-loom', 'update-task-status',
        [types.uint(1), types.uint(1)],
        user1.address
      )
    ]);
    
    assertEquals(block.receipts.length, 1);
    block.receipts[0].result.expectOk();
    
    // Verify status update
    const taskResponse = chain.callReadOnlyFn(
      'task-loom',
      'get-task',
      [types.uint(1)],
      deployer.address
    );
    
    const task = taskResponse.result.expectOk().expectSome();
    assertEquals(task.data['status'].data, 1);
  }
});

Clarinet.test({
  name: "Test unauthorized status update",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const user1 = accounts.get('wallet_1')!;
    const user2 = accounts.get('wallet_2')!;
    
    // Create task
    chain.mineBlock([
      Tx.contractCall('task-loom', 'create-task',
        [
          types.ascii("Test Task"),
          types.ascii("Task Description"),
          types.principal(user1.address),
          types.uint(1677689600)
        ],
        deployer.address
      )
    ]);
    
    // Try to update status with unauthorized user
    let block = chain.mineBlock([
      Tx.contractCall('task-loom', 'update-task-status',
        [types.uint(1), types.uint(1)],
        user2.address
      )
    ]);
    
    assertEquals(block.receipts.length, 1);
    block.receipts[0].result.expectErr().expectUint(101);
  }
});
