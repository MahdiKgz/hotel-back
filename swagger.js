const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: "Hotel Back API",
    version: "1.0.0",
    description: "Swagger documentation for hotel-back project APIs.",
  },
  servers: [
    {
      url: "http://localhost:4000",
      description: "Local development",
    },
  ],
  tags: [
    { name: "Auth" },
    { name: "Hotels" },
    { name: "Domain" },
    { name: "Users" },
    { name: "Rooms" },
    { name: "Reserves" },
    { name: "Stats" },
    { name: "Landing" },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      RegisterInput: {
        type: "object",
        required: ["fullName", "phone", "password"],
        properties: {
          fullName: { type: "string", maxLength: 70 },
          phone: { type: "string", maxLength: 15 },
          email: { type: "string", format: "email", nullable: true },
          password: { type: "string" },
          address: { type: "string", nullable: true },
          avatar: { type: "string", nullable: true },
          bio: { type: "string", nullable: true },
        },
      },
      LoginInput: {
        type: "object",
        required: ["phone", "password"],
        properties: {
          phone: { type: "string" },
          password: { type: "string" },
        },
      },
      OTPInput: {
        type: "object",
        required: ["phone"],
        properties: { phone: { type: "string" } },
      },
      VerifyOTPInput: {
        type: "object",
        required: ["phone", "otp"],
        properties: {
          phone: { type: "string" },
          otp: { type: "string" },
        },
      },
      ResetPasswordInput: {
        type: "object",
        required: ["password", "newPassword", "confirmNewPassword"],
        properties: {
          password: { type: "string" },
          newPassword: { type: "string" },
          confirmNewPassword: { type: "string" },
        },
      },
      UpdateProfileInput: {
        type: "object",
        required: ["fullName", "phone"],
        properties: {
          fullName: { type: "string", maxLength: 70 },
          phone: { type: "string", maxLength: 15 },
          email: { type: "string", format: "email", nullable: true },
          address: { type: "string", nullable: true },
          avatar: { type: "string", nullable: true },
          bio: { type: "string", nullable: true },
        },
      },
      HotelInput: {
        type: "object",
        required: [
          "name",
          "slug",
          "country",
          "city",
          "address",
          "postalCode",
          "stars",
        ],
        properties: {
          name: { type: "string", maxLength: 40 },
          slug: { type: "string", maxLength: 30 },
          country: { type: "integer" },
          city: { type: "integer" },
          address: { type: "string" },
          postalCode: { type: "string" },
          stars: { type: "string", enum: ["1", "2", "3", "4", "5"] },
          metroAccess: { type: "string", enum: ["YES", "NO"] },
          description: { type: "string", nullable: true },
          manager_id: { type: "integer", nullable: true },
        },
      },
      HotelUpdateInput: {
        type: "object",
        properties: {
          name: { type: "string", maxLength: 40 },
          slug: { type: "string", maxLength: 30 },
          country: { type: "integer" },
          city: { type: "integer" },
          address: { type: "string" },
          postalCode: { type: "string" },
          stars: { type: "string", enum: ["1", "2", "3", "4", "5"] },
          metroAccess: { type: "string", enum: ["YES", "NO"] },
          description: { type: "string", nullable: true },
          manager_id: { type: "integer" },
        },
      },
      RoomInput: {
        type: "object",
        required: [
          "name",
          "slug",
          "capacity",
          "status",
          "price",
          "bookType",
          "bathService",
          "balcony",
          "geoDirection",
          "kitchen",
          "hotel_id",
        ],
        properties: {
          name: { type: "string" },
          slug: { type: "string" },
          capacity: { type: "integer" },
          status: { type: "string", enum: ["RESERVED", "MAINTAIN", "EMPTY"] },
          price: { type: "integer" },
          bookType: { type: "string", enum: ["DAILY", "WEEKLY", "MONTHLY"] },
          bathService: { type: "integer" },
          balcony: { type: "integer" },
          geoDirection: {
            type: "string",
            enum: ["NORTH", "SOUTH", "EAST", "WEST"],
          },
          kitchen: { type: "string", enum: ["YES", "NO"] },
          description: { type: "string", nullable: true },
          hotel_id: { type: "integer" },
        },
      },
      AmenityInput: {
        type: "object",
        required: ["title", "isActive"],
        properties: {
          title: { type: "string" },
          description: { type: "string", nullable: true },
          isActive: { type: "boolean" },
        },
      },
      AddHotelAmenityInput: {
        type: "object",
        required: ["amenities"],
        properties: {
          amenities: {
            type: "array",
            items: { type: "integer" },
          },
        },
      },
      GeometryInput: {
        type: "object",
        required: ["type", "coordinates"],
        properties: {
          type: { type: "string", example: "Point" },
          coordinates: {
            type: "array",
            minItems: 2,
            maxItems: 2,
            items: { type: "number" },
            example: [51.389, 35.6892],
          },
        },
      },
      ReserveInput: {
        type: "object",
        required: ["hotelId", "roomId"],
        properties: {
          hotelId: { type: "integer" },
          roomId: { type: "integer" },
          startDate: { type: "string", format: "date" },
          endDate: { type: "string", format: "date" },
          note: { type: "string", nullable: true },
        },
      },
      SuccessResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          statusCode: { type: "integer", example: 200 },
          message: { type: "string", example: "Done" },
          data: { type: "object", nullable: true },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          statusCode: { type: "integer", example: 400 },
          message: { type: "string", example: "Bad request" },
        },
      },
      StatsResponse: {
        type: "object",
        properties: {
          totalHotels: { type: "integer", example: 12 },
          totalRooms: { type: "integer", example: 180 },
          totalReserves: { type: "integer", example: 920 },
          reservesInRange: { type: "integer", example: 35 },
          dateRange: {
            type: "object",
            properties: {
              from: { type: "string", format: "date", example: "2026-01-01" },
              to: { type: "string", format: "date", example: "2026-05-10" },
            },
          },
          reservesTimeline: {
            type: "array",
            items: {
              type: "object",
              properties: {
                date: { type: "string", format: "date", example: "2026-05-01" },
                count: { type: "integer", example: 6 },
              },
            },
          },
        },
      },
    },
  },
  paths: {
    "/api/v1/landing": {
      get: {
        tags: ["Landing"],
        summary: "Get public landing-page overview",
        description:
          "Returns aggregate counts, featured hotels, and popular destinations. The response is cached in Redis.",
        responses: { 200: { description: "OK" } },
      },
    },
    "/api/v1/landing/filters": {
      get: {
        tags: ["Landing"],
        summary: "Get public hotel-filter metadata",
        description:
          "Returns destination, amenity, star, capacity, price, metro-access, and sorting options.",
        responses: { 200: { description: "OK" } },
      },
    },
    "/api/v1/landing/hotels": {
      get: {
        tags: ["Landing"],
        summary: "Search and filter public hotels",
        description:
          "All filters are optional. When checkIn/checkOut are supplied, rooms with overlapping reservations are excluded.",
        parameters: [
          {
            name: "destination",
            in: "query",
            schema: { type: "string", maxLength: 100 },
            description: "Hotel name, slug, address, or province text.",
          },
          {
            name: "provinceId",
            in: "query",
            schema: { type: "integer", minimum: 1 },
          },
          {
            name: "stars",
            in: "query",
            schema: { type: "string", example: "4,5" },
          },
          {
            name: "amenityIds",
            in: "query",
            schema: { type: "string", example: "1,3,4" },
            description: "Hotel must contain every supplied amenity.",
          },
          {
            name: "minPrice",
            in: "query",
            schema: { type: "integer", minimum: 0 },
          },
          {
            name: "maxPrice",
            in: "query",
            schema: { type: "integer", minimum: 0 },
          },
          {
            name: "capacity",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 100 },
          },
          {
            name: "metroAccess",
            in: "query",
            schema: { type: "string", enum: ["YES", "NO"] },
          },
          {
            name: "checkIn",
            in: "query",
            schema: { type: "string", format: "date" },
          },
          {
            name: "checkOut",
            in: "query",
            schema: { type: "string", format: "date" },
          },
          {
            name: "sort",
            in: "query",
            schema: {
              type: "string",
              enum: [
                "recommended",
                "price_asc",
                "price_desc",
                "stars_desc",
                "newest",
                "name_asc",
              ],
            },
          },
          {
            name: "page",
            in: "query",
            schema: { type: "integer", minimum: 1, default: 1 },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 50, default: 12 },
          },
        ],
        responses: {
          200: { description: "OK" },
          400: { description: "Invalid filter or date range" },
        },
      },
    },
    "/api/v1/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register new user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterInput" },
            },
          },
        },
        responses: {
          201: { description: "Created" },
          400: { description: "Validation/User exists" },
        },
      },
    },
    "/api/v1/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login with phone/password",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginInput" },
            },
          },
        },
        responses: {
          200: { description: "OK" },
          400: { description: "Invalid credentials" },
        },
      },
    },
    "/api/v1/auth/send-otp": {
      post: {
        tags: ["Auth"],
        summary: "Send OTP to user phone",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/OTPInput" },
            },
          },
        },
        responses: {
          200: { description: "OTP sent" },
          404: { description: "User not found" },
        },
      },
    },
    "/api/v1/auth/verify": {
      post: {
        tags: ["Auth"],
        summary: "Verify OTP and login",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/VerifyOTPInput" },
            },
          },
        },
        responses: {
          200: { description: "Verified" },
          400: { description: "OTP invalid/expired" },
        },
      },
    },
    "/api/v1/auth/reset-password": {
      post: {
        tags: ["Auth"],
        summary: "Reset authenticated user password",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ResetPasswordInput" },
            },
          },
        },
        responses: {
          200: { description: "Password updated" },
          400: { description: "Validation error" },
        },
      },
    },
    "/api/v1/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get current authenticated user",
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: "OK" },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/api/v1/auth/avatar": {
      post: {
        tags: ["Auth"],
        summary: "Upload user avatar",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["avatar"],
                properties: {
                  avatar: { type: "string", format: "binary" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Avatar set" },
          400: { description: "File missing" },
        },
      },
    },
    "/api/v1/auth/update-profile": {
      put: {
        tags: ["Auth"],
        summary: "Update current user profile",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateProfileInput" },
            },
          },
        },
        responses: {
          200: { description: "Updated" },
          400: { description: "Validation error" },
        },
      },
    },
    "/api/v1/hotel": {
      post: {
        tags: ["Hotels"],
        summary: "Create hotel (ADMIN/MANAGER)",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/HotelInput" },
            },
          },
        },
        responses: {
          201: { description: "Created" },
          400: { description: "Validation/duplicate error" },
        },
      },
      get: {
        tags: ["Hotels"],
        summary: "Get all hotels (ADMIN)",
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: "OK" } },
      },
    },
    "/api/v1/hotel/{slug}": {
      get: {
        tags: ["Hotels"],
        summary: "Get one hotel by slug",
        parameters: [
          {
            name: "slug",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: { 200: { description: "OK" } },
      },
      put: {
        tags: ["Hotels"],
        summary: "Update hotel by slug",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "slug",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/HotelUpdateInput" },
            },
          },
        },
        responses: {
          200: { description: "Updated" },
          400: { description: "Validation/Not found" },
        },
      },
      delete: {
        tags: ["Hotels"],
        summary: "Delete hotel by slug",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "slug",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Deleted" },
          404: { description: "Not found" },
        },
      },
    },
    "/api/v1/hotel/{slug}/cover": {
      post: {
        tags: ["Hotels"],
        summary: "Upload hotel cover image",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "slug",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["cover"],
                properties: { cover: { type: "string", format: "binary" } },
              },
            },
          },
        },
        responses: { 200: { description: "Cover uploaded" } },
      },
    },
    "/api/v1/hotel/{slug}/images": {
      post: {
        tags: ["Hotels"],
        summary: "Upload hotel gallery images",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "slug",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  images: {
                    type: "array",
                    items: { type: "string", format: "binary" },
                  },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Images uploaded" },
          400: { description: "Validation error" },
        },
      },
    },
    "/api/v1/hotel/{hotelId}/amenity": {
      post: {
        tags: ["Hotels"],
        summary: "Set hotel amenities",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "hotelId",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AddHotelAmenityInput" },
            },
          },
        },
        responses: { 201: { description: "Amenities set" } },
      },
      get: {
        tags: ["Hotels"],
        summary: "Get hotel amenities",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "hotelId",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: { 200: { description: "OK" } },
      },
    },
    "/api/v1/hotel/{hotelId}/amenity/{amenityId}": {
      delete: {
        tags: ["Hotels"],
        summary: "Remove one amenity from a hotel",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "hotelId",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
          {
            name: "amenityId",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: { description: "Amenity removed from hotel" },
          404: {
            description:
              "Hotel not found, amenity not found, or amenity is not assigned to this hotel",
          },
        },
      },
    },
    "/api/v1/hotel/{hotelId}/rooms": {
      get: {
        tags: ["Hotels"],
        summary: "Get all rooms for a hotel",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "hotelId",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: { 200: { description: "OK" } },
      },
    },
    "/api/v1/hotel/{hotelId}/geometry": {
      post: {
        tags: ["Hotels"],
        summary: "Set hotel geometry point",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "hotelId",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/GeometryInput" },
            },
          },
        },
        responses: { 200: { description: "Geometry set" } },
      },
      get: {
        tags: ["Hotels"],
        summary: "Get hotel geometry",
        parameters: [
          {
            name: "hotelId",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: { 200: { description: "OK" } },
      },
    },
    "/api/v1/domain/amenity": {
      post: {
        tags: ["Domain"],
        summary: "Create amenity",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AmenityInput" },
            },
          },
        },
        responses: { 201: { description: "Created" } },
      },
      get: {
        tags: ["Domain"],
        summary: "Get all amenities",
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: "OK" } },
      },
    },
    "/api/v1/domain/amenity/{amenityId}": {
      put: {
        tags: ["Domain"],
        summary: "Update amenity",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "amenityId",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AmenityInput" },
            },
          },
        },
        responses: { 200: { description: "Updated" } },
      },
      delete: {
        tags: ["Domain"],
        summary: "Delete amenity",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "amenityId",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: { 200: { description: "Deleted" } },
      },
    },
    "/api/v1/domain/managers": {
      get: {
        tags: ["Domain"],
        summary: "Get manager options",
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: "OK" } },
      },
    },
    "/api/v1/domain/cities": {
      get: {
        tags: ["Domain"],
        summary: "Get cities/provinces options",
        responses: { 200: { description: "OK" } },
      },
    },
    "/api/v1/users": {
      get: {
        tags: ["Users"],
        summary: "Get all users except current",
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: "OK" } },
      },
    },
    "/api/v1/users/{id}": {
      get: {
        tags: ["Users"],
        summary: "Get one user by id",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: { description: "OK" },
          404: { description: "Not found" },
        },
      },
    },
    "/api/v1/users/{id}/ban": {
      post: {
        tags: ["Users"],
        summary: "Ban user by id",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: { description: "Banned" },
          404: { description: "Not found" },
        },
      },
    },
    "/api/v1/room": {
      post: {
        tags: ["Rooms"],
        summary: "Create room",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RoomInput" },
            },
          },
        },
        responses: {
          201: { description: "Created" },
          400: { description: "Validation error" },
        },
      },
    },
    "/api/v1/room/{slug}": {
      get: {
        tags: ["Rooms"],
        summary: "Get room by slug",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "slug",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "OK" },
          404: { description: "Not found" },
        },
      },
      put: {
        tags: ["Rooms"],
        summary: "Update room by slug",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "slug",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RoomInput" },
            },
          },
        },
        responses: { 200: { description: "Updated" } },
      },
      delete: {
        tags: ["Rooms"],
        summary: "Delete room by slug",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "slug",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: { 200: { description: "Deleted" } },
      },
    },
    "/api/v1/reserve": {
      post: {
        tags: ["Reserves"],
        summary: "Create reservation",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ReserveInput" },
            },
          },
        },
        responses: {
          201: { description: "Created" },
          404: { description: "Room reserved or not found" },
        },
      },
    },
    "/api/v1/reserve/{hotelId}": {
      get: {
        tags: ["Reserves"],
        summary: "Get reserves for one hotel (ADMIN)",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "hotelId",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: { 200: { description: "OK" } },
      },
    },
    "/api/v1/reserve/{roomId}": {
      delete: {
        tags: ["Reserves"],
        summary: "Cancel reservation by room id",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "roomId",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: { 200: { description: "Cancelled" } },
      },
    },
    "/api/v1/stats": {
      get: {
        tags: ["Stats"],
        summary: "Get admin dashboard stats",
        description:
          "Returns total hotels, rooms, all reserves, and reserve timeline. If from/to are not provided, range defaults to first reserve startDate up to today.",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "from",
            in: "query",
            required: false,
            schema: { type: "string", format: "date" },
            description: "Start date (YYYY-MM-DD). Default: first reserve startDate.",
          },
          {
            name: "to",
            in: "query",
            required: false,
            schema: { type: "string", format: "date" },
            description: "End date (YYYY-MM-DD). Default: today.",
          },
        ],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                    data: { $ref: "#/components/schemas/StatsResponse" },
                  },
                },
              },
            },
          },
          400: {
            description:
              "Invalid date range/date format or role access error (ADMIN only)",
          },
          401: { description: "Unauthorized" },
        },
      },
    },
  },
};

module.exports = swaggerSpec;
