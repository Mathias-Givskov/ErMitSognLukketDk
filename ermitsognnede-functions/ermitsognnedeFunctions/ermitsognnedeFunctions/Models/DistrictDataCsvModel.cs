using CsvHelper.Configuration.Attributes;
using System;

namespace ermitsognnedeFunctions.Models
{
    public class DistrictDataCsvModel
    {

        [Name("Sognekode")]
        public int DistrictCode { get; set; }

        [Name("Sogn")]
        public string District { get; set; }

        [Name("Kommune1")]
        public string Municipality { get; set; }

        [Name("Kommune2")]
        public string Municipality2 { get; set; }

        [Name("Kommune3")]
        public string Municipality3 { get; set; }

        [Name("Kommunekode1")]
        public int MunicipalityCode { get; set; }

        [Name("Kommunekode2")]
        public int MunicipalityCode2 { get; set; }

        [Name("Kommunekode3")]
        public int MunicipalityCode3 { get; set; }

        [Name("Indbyggertal i sogn")]
        public int DistrictPopulationCount { get; set; }

        [Index(9)]
        public double Incidence { get; set; }

        [Index(10)]
        public int NewInfectedCount { get; set; }

        [Index(11)]
        public double PositivePercentage { get; set; }

        [Name("Status for automatisk nedlukning")]
        public string StatusForAutomaticClosing { get; set; }

        [Name("Påbegyndelsesdato for seneste automatiske nedlukning af sognet")]
        public string StartOfLatestAutomaticShutdown { get; set; }
    }
}
