;; sBTC P2P Marketplace Contract
;; simple on-chain listing storage

;; data vars
(define-data-var listing-counter uint u0)

;; data maps
(define-map listings
  uint
  {
    seller: principal,
    amount: uint,
    price: uint,
    active: bool
  }
)

;; error codes
(define-constant err-not-found (err u404))
(define-constant err-unauthorized (err u403))
(define-constant err-already-sold (err u400))

;; create listing
(define-public (create-listing (amount uint) (price uint))
  (let ((id (+ (var-get listing-counter) u1)))
    (map-set listings id {
      seller: tx-sender,
      amount: amount,
      price: price,
      active: true
    })
    (var-set listing-counter id)
    (ok id)
  )
)

;; read functions
(define-read-only (get-listing (id uint))
  (map-get? listings id)
)

(define-read-only (get-count)
  (var-get listing-counter)
)

;; mark as sold (seller or buyer can mark)
(define-public (mark-sold (id uint))
  (let ((listing (unwrap! (map-get? listings id) err-not-found)))
    (asserts! (get active listing) err-already-sold)
    (map-set listings id (merge listing { active: false }))
    (ok true)
  )
)
