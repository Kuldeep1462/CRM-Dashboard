declare global {
  interface Window {
    google: any
  }

  var mongoose: {
    conn: any
    promise: any
  }
}

export {}
