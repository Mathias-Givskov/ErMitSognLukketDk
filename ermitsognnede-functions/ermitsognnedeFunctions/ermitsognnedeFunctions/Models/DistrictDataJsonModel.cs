using Newtonsoft.Json;
using System;

namespace ermitsognnedeFunctions.Models
{
    public class DistrictDataJsonModel
    {
        [JsonProperty("district_code")]
        public int DistrictCode { get; set; }

        [JsonProperty("district")]
        public string District { get; set; }

        [JsonProperty("municipality")]
        public string Municipality { get; set; }

        [JsonProperty("municipality_2")]
        public string Municipality2 { get; set; }

        [JsonProperty("municipality_3")]
        public string Municipality3 { get; set; }
        [JsonProperty("district_population_count")]
        public int DistrictPopulationCount { get; set; }

        [JsonProperty("incidence")]
        public double Incidence { get; set; }

        [JsonProperty("new_infected_count")]
        public int NewInfectedCount { get; set; }

        [JsonProperty("positive_percentage")]
        public double PositivePercentage { get; set; }

        [JsonProperty("is_closed")]
        public bool? IsClosed { get; set; }

        [JsonProperty("start_of_latest_automatic_shutdown")]
        public DateTime? StartOfLatestAutomaticShutdown { get; set; }
    }
}
