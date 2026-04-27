// Tool definitions exposed to MCP hosts.
// Each tool maps to a Dilix API endpoint.

export interface ToolDef {
  name: string;
  description: string;
  endpoint: string;
  inputSchema: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
}

export const TOOLS: ToolDef[] = [
  {
    name: "analyze_zoning",
    description:
      "Returns zoning classification, HCD compliance status, and state-law overrides (SB-9, SB-79, AB-2011, AB-130, Builder's Remedy) for any US address.",
    endpoint: "zoning-intelligence",
    inputSchema: {
      type: "object",
      properties: {
        address: { type: "string", description: "Full street address" },
        city: { type: "string", description: "City name" },
        state: { type: "string", description: "Two-letter state code (e.g. CA)" },
      },
      required: ["address"],
    },
  },
  {
    name: "get_entitlement_roadmap",
    description:
      "Step-by-step approval pathway for a project: required permits, agency review timelines, fee estimates, CEQA pathway, and risk flags.",
    endpoint: "entitlement-roadmap",
    inputSchema: {
      type: "object",
      properties: {
        address: { type: "string" },
        city: { type: "string" },
        project_type: {
          type: "string",
          description:
            "e.g. 'residential conversion', 'multifamily new construction', 'ADU addition'",
        },
        unit_count: { type: "number" },
      },
      required: ["address", "project_type"],
    },
  },
  {
    name: "lookup_property",
    description:
      "Property records, valuation, sale history, owner info, and physical attributes for any US property.",
    endpoint: "property-lookup",
    inputSchema: {
      type: "object",
      properties: {
        address1: { type: "string", description: "Street address" },
        address2: { type: "string", description: "City, State ZIP" },
      },
      required: ["address1", "address2"],
    },
  },
  {
    name: "find_opportunities",
    description:
      "Scan a city for parcels qualifying under specific state-law incentives (SB-9, SB-79, AB-2011, AB-130, Builder's Remedy, etc.). Returns ranked candidate list.",
    endpoint: "find-opportunities",
    inputSchema: {
      type: "object",
      properties: {
        city: { type: "string" },
        state: { type: "string" },
        incentive: {
          type: "string",
          description:
            "e.g. 'SB-9', 'AB-2011', 'Builder\\'s Remedy'",
        },
        max_results: { type: "number", default: 50 },
      },
      required: ["city", "incentive"],
    },
  },
  {
    name: "scan_portfolio",
    description:
      "Bulk compliance and opportunity scan across up to 50 properties at once. Returns a per-property risk + opportunity report.",
    endpoint: "scan-portfolio",
    inputSchema: {
      type: "object",
      properties: {
        addresses: {
          type: "array",
          items: { type: "string" },
          description: "List of property addresses (max 50)",
        },
      },
      required: ["addresses"],
    },
  },
  {
    name: "watch_parcel",
    description:
      "Set up hourly autonomous monitoring on a parcel. Sends email alerts when zoning, permit, or regulatory status changes.",
    endpoint: "watch-parcel",
    inputSchema: {
      type: "object",
      properties: {
        address: { type: "string" },
        notify_email: { type: "string" },
      },
      required: ["address", "notify_email"],
    },
  },
  {
    name: "track_permit",
    description:
      "Track a specific permit application by ID or address. Returns current status and notifies on status changes.",
    endpoint: "track-permit",
    inputSchema: {
      type: "object",
      properties: {
        permit_id: { type: "string" },
        address: { type: "string" },
        notify_email: { type: "string" },
      },
    },
  },
  {
    name: "analyze_deal",
    description:
      "Full deal underwriting: zoning + property + financials + market rates + risk scoring → returns a verdict (pursue/pass) with reasoning.",
    endpoint: "analyze-deal",
    inputSchema: {
      type: "object",
      properties: {
        address: { type: "string" },
        purchase_price: { type: "number" },
        intended_use: { type: "string" },
        notes: { type: "string" },
      },
      required: ["address"],
    },
  },
  {
    name: "source_deals",
    description:
      "Source candidate properties matching investment criteria across one or more markets.",
    endpoint: "source-outbound-leads",
    inputSchema: {
      type: "object",
      properties: {
        markets: {
          type: "array",
          items: { type: "string" },
          description: "Cities or metros",
        },
        criteria: {
          type: "object",
          description:
            "e.g. { min_units: 4, max_price: 5000000, zoning: ['multifamily'] }",
        },
      },
      required: ["markets"],
    },
  },
  {
    name: "get_market_rates",
    description:
      "Live SOFR, 10Y Treasury, and CRE cap-rate spreads for current underwriting.",
    endpoint: "market-rates",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
];
