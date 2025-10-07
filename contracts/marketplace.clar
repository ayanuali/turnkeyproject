;; sBTC P2P Marketplace Contract
;; stores listings on-chain

;; data structures
(define-map listings
  { listing-id: uint }
  {
    seller: principal,
    amount: uint,
    price: uint,
    status: (string-ascii 20),
    created-at: uint
  }
)

(define-data-var listing-counter uint u0)

;; error codes
(define-constant err-not-found (err u404))
(define-constant err-unauthorized (err u403))
(define-constant err-already-sold (err u400))

;; create new listing
(define-public (create-listing (amount uint) (price uint))
  (let
    (
      (listing-id (+ (var-get listing-counter) u1))
    )
    (map-set listings
      { listing-id: listing-id }
      {
        seller: tx-sender,
        amount: amount,
        price: price,
        status: "active",
        created-at: block-height
      }
    )
    (var-set listing-counter listing-id)
    (ok listing-id)
  )
)

;; get listing by id
(define-read-only (get-listing (listing-id uint))
  (map-get? listings { listing-id: listing-id })
)

;; get total listings count
(define-read-only (get-listing-count)
  (ok (var-get listing-counter))
)

;; buy listing (marks as sold)
(define-public (buy-listing (listing-id uint))
  (let
    (
      (listing (unwrap! (map-get? listings { listing-id: listing-id }) err-not-found))
    )
    ;; check not already sold
    (asserts! (is-eq (get status listing) "active") err-already-sold)

    ;; check not buying own listing
    (asserts! (not (is-eq tx-sender (get seller listing))) err-unauthorized)

    ;; mark as sold
    (map-set listings
      { listing-id: listing-id }
      (merge listing { status: "sold" })
    )

    (ok true)
  )
)

;; cancel listing (only seller can cancel)
(define-public (cancel-listing (listing-id uint))
  (let
    (
      (listing (unwrap! (map-get? listings { listing-id: listing-id }) err-not-found))
    )
    ;; check is seller
    (asserts! (is-eq tx-sender (get seller listing)) err-unauthorized)

    ;; check not already sold
    (asserts! (is-eq (get status listing) "active") err-already-sold)

    ;; mark as cancelled
    (map-set listings
      { listing-id: listing-id }
      (merge listing { status: "cancelled" })
    )

    (ok true)
  )
)
