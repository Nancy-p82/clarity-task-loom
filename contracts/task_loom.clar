;; Constants for task status
(define-constant STATUS_TODO u0)
(define-constant STATUS_IN_PROGRESS u1)
(define-constant STATUS_COMPLETED u2)

;; Error codes
(define-constant ERR_TASK_NOT_FOUND (err u100))
(define-constant ERR_UNAUTHORIZED (err u101))
(define-constant ERR_INVALID_STATUS (err u102))

;; Define task structure
(define-map tasks 
  { task-id: uint }
  {
    title: (string-ascii 64),
    description: (string-ascii 256),
    assignee: principal,
    status: uint,
    deadline: uint,
    created-by: principal,
    created-at: uint
  }
)

;; Keep track of task count
(define-data-var task-counter uint u0)

;; Create new task
(define-public (create-task (title (string-ascii 64)) 
                           (description (string-ascii 256))
                           (assignee principal)
                           (deadline uint))
  (let ((task-id (+ (var-get task-counter) u1)))
    (map-set tasks
      { task-id: task-id }
      {
        title: title,
        description: description,
        assignee: assignee,
        status: STATUS_TODO,
        deadline: deadline,
        created-by: tx-sender,
        created-at: block-height
      }
    )
    (var-set task-counter task-id)
    (ok task-id)
  )
)

;; Update task status
(define-public (update-task-status (task-id uint) (new-status uint))
  (let ((task (unwrap! (map-get? tasks { task-id: task-id }) ERR_TASK_NOT_FOUND)))
    (asserts! (or (is-eq tx-sender (get assignee task))
                 (is-eq tx-sender (get created-by task)))
             ERR_UNAUTHORIZED)
    (asserts! (and (>= new-status STATUS_TODO)
                  (<= new-status STATUS_COMPLETED))
             ERR_INVALID_STATUS)
    (ok (map-set tasks
      { task-id: task-id }
      (merge task { status: new-status })
    ))
  )
)

;; Get task details
(define-read-only (get-task (task-id uint))
  (ok (map-get? tasks { task-id: task-id }))
)

;; Get tasks by assignee
(define-read-only (get-tasks-by-assignee (assignee principal))
  (filter tasks (lambda (task)
    (is-eq (get assignee (get value task)) assignee)
  ))
)
