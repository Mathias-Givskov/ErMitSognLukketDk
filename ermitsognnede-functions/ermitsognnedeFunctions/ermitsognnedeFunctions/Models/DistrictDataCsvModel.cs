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
