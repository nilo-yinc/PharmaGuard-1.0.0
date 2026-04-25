PHENOTYPE_MAP = {
    "CYP2C19": {
        "*1/*1": "NM",
        "*1/*2": "IM",
        "*2/*2": "PM",
        "*1/*17": "RM",
        "*17/*17": "UM",
    },
    "CYP2D6": {
        "*1/*1": "NM",
        "*1/*2": "NM",
        "*1/*4": "IM",
        "*4/*4": "PM",
    },
    "CYP2C9": {
        "*1/*1": "NM",
        "*1/*2": "IM",
        "*1/*3": "IM",
        "*2/*2": "IM",
        "*2/*3": "PM",
        "*3/*3": "PM",
    },
    "SLCO1B1": {
        "*1/*1": "Normal",
        "*1/*15": "Decreased",
        "*1/*5": "Decreased",
        "*5/*5": "Low",
    },
    "TPMT": {
        "*1/*1": "Normal",
        "*1/*2": "Intermediate",
        "*1/*3A": "Intermediate",
        "*3A/*3A": "Low",
    },
    "DPYD": {
        "*1/*1": "Normal",
        "*2A/*1": "Intermediate",
        "*2A/*2A": "Deficient",
    }
}

def canonicalize_diplotype(diplotype: str) -> str:
    parts = diplotype.split("/")
    if len(parts) != 2:
        return diplotype
    left, right = parts[0].strip(), parts[1].strip()
    if left == "*1" and right != "*1":
        return f"{left}/{right}"
    if right == "*1" and left != "*1":
        return f"*1/{left}"
    ordered = sorted([left, right])
    return f"{ordered[0]}/{ordered[1]}"

def get_phenotype(gene: str, diplotype: str) -> str:
    gene_map = PHENOTYPE_MAP.get(gene, {})
    canonical = canonicalize_diplotype(diplotype)
    phenotype = gene_map.get(canonical)
    if phenotype:
        return phenotype
    # fallback for unphased diplotypes in opposite order
    parts = canonical.split("/")
    if len(parts) == 2:
        reverse = f"{parts[1]}/{parts[0]}"
        return gene_map.get(reverse, "Unknown")
    return "Unknown"
