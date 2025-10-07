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

;; cancel listing (only seller can cancel)
(define-public (cancel-listing (id uint))
  (let ((listing (unwrap! (map-get? listings id) err-not-found)))
    (asserts! (is-eq tx-sender (get seller listing)) err-unauthorized)
    (asserts! (get active listing) err-already-sold)
    (map-set listings id (merge listing { active: false }))
    (ok true)
  )
)

;; update listing price (only seller can update, only if active)
(define-public (update-price (id uint) (new-price uint))
  (let ((listing (unwrap! (map-get? listings id) err-not-found)))
    (asserts! (is-eq tx-sender (get seller listing)) err-unauthorized)
    (asserts! (get active listing) err-already-sold)
    (map-set listings id (merge listing { price: new-price }))
    (ok true)
  )
)
