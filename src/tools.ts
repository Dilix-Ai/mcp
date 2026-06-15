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
      "Investment-grade deal underwriting with the regulatory layer attached. " +
      "Returns: financials (cap rate, DSCR, NOI, cash-on-cash, GRM, break-even occupancy, LTV), " +
      "regulatory resolution (max legal annual rent increase % + source ordinance + municipal-code citation + confidence + effective period — sourced from the California Apartment Association 1/2026 ordinance chart for CA properties, AB-1482 statewide fallback elsewhere), " +
      "year-by-year projection (NOI under cap vs. unrestricted market growth for the chosen hold period), " +
      "drag summary (cumulative rent foregone + capitalized exit-value haircut over the hold), " +
      "and a verdict (strong/workable/caution/pass) with reasoning. " +
      "Use this tool when an agent needs to underwrite a multifamily acquisition, run a 'what-if' on a regulatory scenario, or surface NOI risk that conventional underwriting models miss.",
    endpoint: "analyze-deal",
    inputSchema: {
      type: "object",
      properties: {
        // Identity
        address: { type: "string", description: "Full street address" },
        property_name: { type: "string", description: "Optional display name (e.g. 'The Bryant')" },
        city: { type: "string", description: "City name — required for rent control resolution" },
        county: { type: "string", description: "County name — used for AB-1482 regional CPI lookup" },
        state: { type: "string", description: "Two-letter state code, default CA" },
        zip: { type: "string" },
        // Property characteristics
        year_built: {
          type: "number",
          description: "Year of original construction. Drives Costa-Hawkins + AB-1482 15-year eligibility filters. Default 1970 if unknown.",
        },
        unit_count: { type: "number", description: "Total dwelling units in the building" },
        property_type: {
          type: "string",
          enum: [
            "single_family",
            "condo",
            "duplex",
            "triplex",
            "fourplex",
            "multifamily_5plus",
            "adu",
            "mobile_home",
          ],
          description: "Used for Costa-Hawkins SFH/condo exemptions",
        },
        is_owner_occupied: { type: "boolean" },
        is_subsidized: { type: "boolean", description: "Deed-restricted affordable / LIHTC / Section 8" },
        // Financials
        purchase_price: { type: "number" },
        current_gross_monthly_rents: { type: "number" },
        current_annual_rent: { type: "number", description: "Alternative to monthly" },
        vacancy_rate: { type: "number", description: "Percent, default 7 (93% occupancy)" },
        other_monthly_income: { type: "number" },
        // Expenses (provide either ratio OR itemized)
        expense_ratio: { type: "number", description: "Operating expenses as % of EGI" },
        property_taxes: { type: "number", description: "Annual" },
        insurance: { type: "number", description: "Annual" },
        property_management: { type: "number", description: "% of EGI, default 8" },
        maintenance_repairs: { type: "number", description: "Annual" },
        utilities: { type: "number", description: "Annual" },
        reserves: { type: "number", description: "Annual" },
        other_expenses: { type: "number", description: "Annual" },
        // Financing
        down_payment_pct: { type: "number", description: "Default 25" },
        interest_rate: { type: "number", description: "Annual %, default 6.75" },
        loan_amortization_years: { type: "number", description: "Default 30" },
        // Underwriting assumptions
        hold_years: { type: "number", description: "Hold period for projection, default 5, range 1-15" },
        market_growth_pct: {
          type: "number",
          description: "Annual unrestricted-rent-growth assumption for the comparison line, default 4",
        },
        expense_growth_pct: { type: "number", description: "Annual expense growth assumption, default 3" },
      },
      required: ["address", "city", "purchase_price"],
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
  {
    name: "request_demo_render",
    description:
      "Live-renders a Dilix demo bundle for an address that doesn't have one yet. Fires GitHub Actions to run the full render pipeline (3D screenshot, NOI counterfactual, citations) and returns immediately. The bundle is typically available 60-90 seconds later — call `lookup_demo` with the same address to fetch it. " +
      "Use this when `lookup_demo` returned `found: false` and you want to produce the demo on demand. Ideal for live cofounder/investor pitches: 'type any address, I'll render it'.",
    endpoint: "trigger-demo-render",
    inputSchema: {
      type: "object",
      properties: {
        address: {
          type: "string",
          description: "Full street address",
        },
        source_url: {
          type: "string",
          description: "Optional LoopNet/Crexi listing URL — if provided, the render scrapes broker NOI for full $ delta computation",
        },
      },
      required: ["address"],
    },
  },
  {
    name: "lookup_demo",
    description:
      "Returns the latest pre-rendered Dilix demo bundle for an address: 3D hero + HUD images, broker headline (LoopNet ask + cap), Dilix correction (rent cap, 5-yr NOI drag, exit haircut, corrected NOI, valuation gap), and a public shareable URL at /demo/{slug}. " +
      "Use this when an agent or chat user wants to surface the Dilix counterfactual on a property — pitches, deck slides, prospect emails, social posts. " +
      "Read-only: returns a 'not found' envelope (with a hint to live-render at /feasibility-3d) if no demo exists yet for the address. The nightly auto-discovery cron renders new SF/Oakland multifamily listings.",
    endpoint: "lookup-demo",
    inputSchema: {
      type: "object",
      properties: {
        address: {
          type: "string",
          description: "Full street address, e.g. '2625 Polk St, San Francisco, CA 94109'",
        },
      },
      required: ["address"],
    },
  },
];
