package constants

type Personality int

// Define the multipliers for each personality.
var PersonalityStatMultipliers = map[Personality]map[string]float64{
	PersonalityAloof: {
		"hp":   1.0,
		"atk":  1.0,
		"def":  1.0,
		"satk": 1.0,
		"sdef": 1.0,
		"spd":  1.0,
	},
	PersonalityStoic: {
		"hp":   1.0,
		"atk":  1.0,
		"def":  1.0,
		"satk": 1.0,
		"sdef": 1.0,
		"spd":  1.0,
	},
	PersonalityMerry: {
		"hp":   1.0,
		"atk":  1.0,
		"def":  1.0,
		"satk": 1.1,
		"sdef": 1.0,
		"spd":  1.1,
	},
	PersonalityResolute: {
		"hp":   1.0,
		"atk":  1.0,
		"def":  1.0,
		"satk": 1.1,
		"sdef": 1.0,
		"spd":  1.0,
	},
	PersonalitySkeptical: {
		"hp":   1.0,
		"atk":  0.9,
		"def":  1.0,
		"satk": 1.0,
		"sdef": 1.0,
		"spd":  1.0,
	},
	PersonalityBrooding: {
		"hp":   1.05,
		"atk":  1.0,
		"def":  1.0,
		"satk": 1.0,
		"sdef": 1.0,
		"spd":  1.0,
	},
	PersonalityBrave: {
		"hp":   1.0,
		"atk":  1.1,
		"def":  1.0,
		"satk": 1.0,
		"sdef": 1.0,
		"spd":  0.9,
	},
	PersonalityInsightful: {
		"hp":   1.0,
		"atk":  1.0,
		"def":  1.0,
		"satk": 1.1,
		"sdef": 1.0,
		"spd":  1.0,
	},
	PersonalityPlayful: {
		"hp":   1.0,
		"atk":  1.0,
		"def":  1.0,
		"satk": 1.0,
		"sdef": 1.0,
		"spd":  1.1,
	},
	PersonalityRash: {
		"hp":   1.0,
		"atk":  1.1,
		"def":  1.0,
		"satk": 1.0,
		"sdef": 0.9,
		"spd":  1.0,
	},
}

// String method to get the string representation of each Personality.
func (p Personality) String() string {
	return [...]string{
		"Aloof",
		"Stoic",
		"Merry",
		"Resolute",
		"Skeptical",
		"Brooding",
		"Brave",
		"Insightful",
		"Playful",
		"Rash",
	}[p]
}

// Personalities is an array of all available personalities.
var Personalities = []Personality{
	PersonalityAloof,
	PersonalityStoic,
	PersonalityMerry,
	PersonalityResolute,
	PersonalitySkeptical,
	PersonalityBrooding,
	PersonalityBrave,
	PersonalityInsightful,
	PersonalityPlayful,
	PersonalityRash,
}

const (
	PersonalityAloof Personality = iota // Frieren
	PersonalityStoic                    // Himmel
	PersonalityMerry                    // Heiter
	PersonalityResolute
	PersonalitySkeptical
	PersonalityBrooding
	PersonalityBrave
	PersonalityInsightful
	PersonalityPlayful
	PersonalityRash // Stark
)