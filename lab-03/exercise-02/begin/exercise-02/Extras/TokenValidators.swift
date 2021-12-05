//
//  TokenValidators.swift
//  JWTDecode
//
//  Copyright © 2018 Auth0. All rights reserved.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import Foundation
import JWTDecode

/// IDTokenValidation will validate claims
public struct IDTokenValidation: ValidatorJWT {

    /// `iss` claim value
    public let issuer: String

    /// `aud` claim value
    public let audience: String

    /// Initialiser
    ///
    /// - Parameters:
    ///   - issuer: Value to validate the `iss` claim against
    ///   - audience: Value to validate the `aud` claim against
    public init(issuer: String, audience: String) {
        self.issuer = issuer
        self.audience = audience
    }
    
    /// Validate a JWT
    ///
    /// - Parameters:
    ///   - jwt: The JWT to validate
    ///   - nonce: (Optional) nonce value
    /// - Returns: Success status
    public func validate(_ jwt: JWT, nonce: String? = nil) -> Bool {
        guard let jwtAudience = jwt.audience else { return false }
        if issuer != jwt.issuer { return false }
        if !jwtAudience.contains(audience) { return false }
        if jwt.expired { return false }
        if let jwtNonce = jwt.claim(name: "nonce").string {
            guard let nonce = nonce, nonce == jwtNonce else { return false }
        }
        return true
    }
}

