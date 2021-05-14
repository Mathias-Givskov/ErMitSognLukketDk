using CsvHelper.Configuration.Attributes;
using System;

namespace ermitsognnedeFunctions.Models
{
    public class MunicipalityDataCsvModel
    {
        [Name("Kommune")]
        public string Municipality { get; set; }

        [Name("Kommunekode")]
        public int MunicipalityCode { get; set; }

        [Name("Indbyggertal i kommunen")]
        public int MunicipalityPopulationCount { get; set; }

        [Index(3)]
        public double Incidence { get; set; }

        [Name("Status for automatisk nedlukning")]
        public string StatusForAutomaticClosing { get; set; }

        [Name("Påbegyndelsesdato for seneste automatiske nedlukning af kommunen")]
        public string StartOfLatestAutomaticShutdown { get; set; }
    }
}
