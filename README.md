# TaskLoom
A minimalist task manager app designed for creative professionals to organize their workflow, built on the Stacks blockchain.

## Features
- Create and manage tasks
- Set task status (todo, in-progress, completed)
- Assign tasks to specific users
- Track task deadlines
- Add task descriptions and tags

## Setup and Installation
1. Clone the repository
2. Install Clarinet for local development
3. Run `clarinet check` to verify contracts
4. Run `clarinet test` to execute test suite

## Usage Examples
```clarity
;; Create a new task
(contract-call? .task-loom create-task "Design homepage" "Create mockups for landing page" 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM u1677689600)

;; Update task status
(contract-call? .task-loom update-task-status u1 u1)

;; Get task details
(contract-call? .task-loom get-task u1)
```

## Dependencies
- Clarity language
- Clarinet for testing and deployment
