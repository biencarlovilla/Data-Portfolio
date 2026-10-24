
const queries = [
    {
        title: "Database Creation",
        description: "Set up the retail transaction table.",
        code: `CREATE TABLE IF NOT EXISTS retail_sales (
    invoice_no VARCHAR(20),
    stock_code VARCHAR(20),
    description TEXT,
    quantity INTEGER,
    invoice_date TIMESTAMP,
    unit_price NUMERIC(10,2),
    customer_id VARCHAR(20),
    country VARCHAR(100)
);`,
        headers: ["Result"],
        rows: [["CREATE TABLE"]],
        insight: "Created the retail_sales table with eight columns."
    },
    {
        title: "Data Cleaning",
        description: "Create a reusable view for positive sales.",
        code: `CREATE OR REPLACE VIEW clean_retail_sales AS
SELECT
    invoice_no,
    stock_code,
    description,
    quantity,
    invoice_date,
    unit_price,
    customer_id,
    country,
    quantity * unit_price AS total_sales
FROM retail_sales
WHERE quantity > 0
  AND unit_price > 0
  AND invoice_no NOT LIKE 'C%';

SELECT COUNT(*) FROM clean_retail_sales;`,
        headers: ["count"],
        rows: [["530100"]],
        insight: "The view contains 530,100 positive-sales records. The original data remains unchanged."
    },
    {
        title: "Total Positive Sales",
        description: "Calculate the total value of positive transactions.",
        code: `SELECT
    ROUND(SUM(total_sales), 2) AS total_revenue
FROM clean_retail_sales;`,
        headers: ["total_revenue"],
        rows: [["10666684.54"]],
        insight: "Positive sales totaled £10.67 million before returns, refunds, and adjustments."
    },
    {
        title: "Monthly Sales Analysis",
        description: "Identify sales trends over time.",
        code: `SELECT
    TO_CHAR(invoice_date, 'YYYY-MM') AS sales_month,
    ROUND(SUM(total_sales), 2) AS monthly_revenue
FROM clean_retail_sales
GROUP BY TO_CHAR(invoice_date, 'YYYY-MM')
ORDER BY sales_month;`,
        headers: ["sales_month", "monthly_revenue"],
        rows: [
            ["2010-12", "823746.14"],
            ["2011-01", "691364.56"],
            ["2011-02", "523631.89"],
            ["2011-03", "717639.36"],
            ["2011-04", "537808.62"],
            ["2011-05", "770536.02"],
            ["2011-06", "761739.90"],
            ["2011-07", "719221.19"],
            ["2011-08", "759138.38"],
            ["2011-09", "1058590.17"],
            ["2011-10", "1154979.30"],
            ["2011-11", "1509496.33"],
            ["2011-12", "638792.68"]
        ],
        insight: "November 2011 generated the highest monthly positive sales at approximately £1.51 million. December was a partial month."
    },
    {
        title: "Top Products",
        description: "Rank products by positive sales revenue.",
        code: `SELECT
    description,
    SUM(quantity) AS total_units_sold,
    ROUND(SUM(total_sales), 2) AS total_revenue
FROM clean_retail_sales
WHERE description IS NOT NULL
  AND UPPER(TRIM(description)) NOT IN (
    'DOTCOM POSTAGE',
    'POSTAGE',
    'MANUAL'
  )
GROUP BY description
ORDER BY total_revenue DESC
LIMIT 10;`,
        headers: ["description", "units_sold", "revenue"],
        rows: [
            ["REGENCY CAKESTAND 3 TIER", "13879", "174484.74"],
            ["PAPER CRAFT , LITTLE BIRDIE", "80995", "168469.60"],
            ["WHITE HANGING HEART T-LIGHT HOLDER", "37891", "106292.77"],
            ["PARTY BUNTING", "18295", "99504.33"],
            ["JUMBO BAG RED RETROSPOT", "48474", "94340.05"],
            ["MEDIUM CERAMIC TOP STORAGE JAR", "78033", "81700.92"],
            ["RABBIT NIGHT LIGHT", "30788", "66964.99"],
            ["PAPER CHAIN KIT 50'S CHRISTMAS", "19355", "64952.29"],
            ["ASSORTED COLOUR BIRD ORNAMENT", "36461", "59094.93"],
            ["CHILLI LIGHTS", "10306", "54117.76"]
        ],
        insight: "Regency Cakestand 3 Tier ranked highest after excluding three identified non-merchandise descriptions."
    },
    {
        title: "Sales by Country",
        description: "Compare positive sales across geographic markets.",
        code: `SELECT
    country,
    COUNT(DISTINCT invoice_no) AS total_orders,
    ROUND(SUM(total_sales), 2) AS total_revenue
FROM clean_retail_sales
GROUP BY country
ORDER BY total_revenue DESC
LIMIT 10;`,
        headers: ["country", "orders", "revenue"],
        rows: [
            ["United Kingdom", "18019", "9025222.08"],
            ["Netherlands", "94", "285446.34"],
            ["EIRE", "288", "283453.96"],
            ["Germany", "457", "228867.14"],
            ["France", "392", "209715.11"],
            ["Australia", "57", "138521.31"],
            ["Spain", "90", "61577.11"],
            ["Switzerland", "54", "57089.90"],
            ["Belgium", "98", "41196.34"],
            ["Sweden", "36", "38378.33"]
        ],
        insight: "The United Kingdom accounted for approximately 84.6% of positive sales."
    },
    {
        title: "Top Customers",
        description: "Identify the highest-spending customers.",
        code: `SELECT
    customer_id,
    COUNT(DISTINCT invoice_no) AS total_orders,
    ROUND(SUM(total_sales), 2) AS total_spent
FROM clean_retail_sales
WHERE customer_id IS NOT NULL
GROUP BY customer_id
ORDER BY total_spent DESC
LIMIT 10;`,
        headers: ["customer_id", "orders", "total_spent"],
        rows: [
            ["14646", "73", "280206.02"],
            ["18102", "60", "259657.30"],
            ["17450", "46", "194550.79"],
            ["16446", "2", "168472.50"],
            ["14911", "201", "143825.06"],
            ["12415", "21", "124914.53"],
            ["14156", "55", "117379.63"],
            ["17511", "31", "91062.38"],
            ["16029", "63", "81024.84"],
            ["12346", "1", "77183.60"]
        ],
        insight: "Customer 14646 generated the highest positive spending among customers with recorded IDs."
    },
    {
        title: "Average Order Value",
        description: "Calculate average positive sales per invoice.",
        code: `SELECT
    ROUND(
        SUM(total_sales) /
        NULLIF(COUNT(DISTINCT invoice_no), 0),
        2
    ) AS average_order_value
FROM clean_retail_sales;`,
        headers: ["average_order_value"],
        rows: [["534.40"]],
        insight: "The average positive sales value per distinct invoice was £534.40."
    }
];

const walkthrough = document.getElementById("sql-walkthrough");

queries.forEach((query, index) => {
    const details = document.createElement("details");
    details.className = "sql-accordion";

    const summary = document.createElement("summary");
    const heading = document.createElement("span");
    const title = document.createElement("strong");
    const description = document.createElement("small");

    title.textContent =
        `${String(index + 1).padStart(2, "0")} / ${query.title}`;
    description.textContent = query.description;

    heading.append(title, description);

    const chevron = document.createElement("span");
    chevron.className = "chevron";
    chevron.textContent = "⌄";

    summary.append(heading, chevron);
    details.appendChild(summary);

    const content = document.createElement("div");
    content.className = "sql-detail";

    const codeHeading = document.createElement("div");
    codeHeading.className = "code-heading";
    codeHeading.append(document.createTextNode("SQL QUERY"));

    const copyButton = document.createElement("button");
    copyButton.className = "copy-sql";
    copyButton.type = "button";
    copyButton.textContent = "Copy code";

    copyButton.addEventListener("click", async () => {
        try {
            await navigator.clipboard.writeText(query.code);
            copyButton.textContent = "Copied!";
            setTimeout(() => {
                copyButton.textContent = "Copy code";
            }, 1500);
        } catch {
            copyButton.textContent = "Copy unavailable";
        }
    });

    codeHeading.appendChild(copyButton);
    content.appendChild(codeHeading);

    const pre = document.createElement("pre");
    const code = document.createElement("code");
    code.textContent = query.code;
    pre.appendChild(code);
    content.appendChild(pre);

    const outputHeading = document.createElement("h3");
    outputHeading.textContent = "QUERY OUTPUT";
    content.appendChild(outputHeading);

    const outputScroll = document.createElement("div");
    outputScroll.className = "output-scroll";

    const table = document.createElement("table");
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");

    query.headers.forEach(header => {
        const th = document.createElement("th");
        th.textContent = header;
        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");

    query.rows.forEach(row => {
        const tr = document.createElement("tr");

        row.forEach(value => {
            const td = document.createElement("td");
            td.textContent = value;
            tr.appendChild(td);
        });

        tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    outputScroll.appendChild(table);
    content.appendChild(outputScroll);

    const note = document.createElement("p");
    note.className = "output-note";
    note.textContent =
        `${query.rows.length} recorded output row(s) displayed.`;
    content.appendChild(note);

    const insightHeading = document.createElement("h3");
    insightHeading.textContent = "WHAT THIS SHOWS";
    content.appendChild(insightHeading);

    const insight = document.createElement("p");
    insight.textContent = query.insight;
    content.appendChild(insight);

    details.appendChild(content);
    walkthrough.appendChild(details);
});
